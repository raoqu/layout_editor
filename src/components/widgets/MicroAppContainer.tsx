import React, { useEffect, useRef, useState } from 'react';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';
import type { WidgetComponentProps } from '../../types';

/**
 * MicroAppContainer
 * 
 * A component that uses qiankun to load and render remote micro-frontend widgets
 */
const MicroAppContainer: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [microApp, setMicroApp] = useState<MicroApp | null>(null);
  const [mountAttempts, setMountAttempts] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { properties } = widget;
  const remoteUrl = properties.remoteUrl as string;
  const remotePath = properties.remotePath as string;
  
  // Effect to handle mounting with retry logic
  useEffect(() => {
    if (!remoteUrl || !containerRef.current) {
      console.error('[MicroAppContainer] No remote URL provided or container not ready');
      return;
    }
    
    // Track mounting attempts for debugging
    setMountAttempts(prev => prev + 1);
    console.log(`[MicroAppContainer] Mount attempt ${mountAttempts + 1} for widget ${widget.id}`);
    
    // Check if container is visible in DOM
    const containerElement = containerRef.current;
    const isVisible = containerElement.offsetParent !== null;
    
    if (!isVisible) {
      console.log(`[MicroAppContainer] Container for widget ${widget.id} is not visible yet, will retry`);
      // If container is not visible yet, retry after a short delay
      const retryTimeout = setTimeout(() => {
        if (mountAttempts < 3) {
          setMountAttempts(prev => prev + 1);
        }
      }, 500);
      return () => clearTimeout(retryTimeout);
    }
    
    // Check if we have a specific entry point provided in the properties
    // This is set by the WidgetPluginSystem when registering remote widgets
    const entryPath = properties.entry as string;
    
    // Construct the full entry URL
    // If entry is provided, use it directly
    // Otherwise, fallback to constructing from remoteUrl and remotePath
    // Ensure the URL ends with .umd.js if it doesn't have an extension
    let entryUrl = entryPath || (remotePath ? `${remoteUrl}${remotePath}` : remoteUrl);
    
    // If the URL doesn't end with .js or .umd.js, add the extension
    if (!entryUrl.endsWith('.js') && !entryUrl.endsWith('.umd.js')) {
      entryUrl = `${entryUrl}.umd.js`;
      console.log(`[MicroAppContainer] Added .umd.js extension to entry URL: ${entryUrl}`);
    }
    
    // For qiankun, we need to ensure we're loading the built UMD file, not the source file
    // This prevents the [import-html-entry]: error with src/main.tsx
    console.log(`[MicroAppContainer] Loading micro app from ${entryUrl} for widget ${widget.id}`);
    console.log(`[MicroAppContainer] Widget type: ${widget.type}, Remote path: ${remotePath || 'none'}`);
    console.log(`[MicroAppContainer] Using entry: ${entryPath || 'default path'}`);
    
    if (!entryUrl) {
      console.error(`[MicroAppContainer] No entry URL provided for widget ${widget.id}`);
      return;
    }

    console.log(`[MicroAppContainer] Loading micro app for widget ${widget.id} from ${entryUrl}`);
    
    // Create a consistent name for the micro app
    const microAppName = `widget-${widget.id}`;
    
    // Use an entry object with scripts array to explicitly load the UMD bundle
    // Add timestamp to bust cache and ensure fresh loading
    const cacheBuster = `?t=${Date.now()}`;
    const entryConfig = {
      scripts: [`${entryUrl}${cacheBuster}`]
    };
    
    // Add a global error handler for script loading errors
    window.addEventListener('error', (event) => {
      if (event.filename && event.filename.includes(entryUrl)) {
        console.error(`[MicroAppContainer] Script loading error for ${entryUrl}:`, event.error);
      }
    }, { once: true });

    try {
      // First try with entry object configuration
      console.log(`[MicroAppContainer] Loading with entry config:`, entryConfig);
      
      const app = loadMicroApp({
        name: microAppName,
        entry: entryConfig,
        container: containerRef.current as HTMLElement,
        props: {
          widgetId: widget.id,
          widgetType: widget.type,
          widgetProperties: properties,
          isSelected
        }
      }, {
        // Additional options for qiankun
        singular: false,
        sandbox: { 
          strictStyleIsolation: false,
          experimentalStyleIsolation: true
        }
      });

      // Set up error handler for the app
      app.loadPromise.catch((err) => {
        console.error(`[MicroAppContainer] Error loading micro app for widget ${widget.id}:`, err);
        
        // If loading fails with the entry config, try with direct URL as fallback
        console.log(`[MicroAppContainer] Trying fallback direct URL loading for ${entryUrl}`);
        
        try {
          // Try loading with direct URL instead of entry config
          const fallbackApp = loadMicroApp({
            name: microAppName,
            entry: entryUrl.split('?')[0], // Remove any query params
            container: containerRef.current as HTMLElement,
            props: {
              widgetId: widget.id,
              widgetType: widget.type,
              widgetProperties: properties,
              isSelected
            }
          }, {
            singular: false,
            sandbox: { experimentalStyleIsolation: true }
          });
          
          setMicroApp(fallbackApp);
          setMounted(true);
        } catch (fallbackErr) {
          console.error(`[MicroAppContainer] Fallback loading also failed:`, fallbackErr);
          setMounted(false);
        }
      });
      
      setMicroApp(app);
      setMounted(true);
      console.log(`[MicroAppContainer] Successfully mounted widget ${widget.id}`);
      
      return () => {
        console.log(`[MicroAppContainer] Unmounting micro app for widget ${widget.id}`);
        if (app) {
          try {
            app.unmount();
          } catch (err) {
            console.error(`[MicroAppContainer] Error unmounting app:`, err);
          }
        }
        setMounted(false);
      };
    } catch (error) {
      console.error(`[MicroAppContainer] Error mounting widget ${widget.id}:`, error);
      setMounted(false);
      return undefined;
    }
  }, [remoteUrl, widget.id]);
  
  // Update props when they change
  useEffect(() => {
    if (microApp) {
      console.log(`[MicroAppContainer] Updating props for widget ${widget.id}`);
      
      // Give the micro app some time to initialize before trying to update props
      const updateProps = () => {
        try {
          // Try multiple naming conventions for the global props object
          const possibleNames = [
            `qiankunProps_widget-${widget.id}`,
            `qiankunProps_${widget.id}`,
            `props_widget-${widget.id}`,
            `props_${widget.id}`
          ];
          
          // Find the first available props object
          let globalProps = null;
          for (const name of possibleNames) {
            if ((window as any)[name]) {
              globalProps = (window as any)[name];
              console.log(`[MicroAppContainer] Found props object with name: ${name}`);
              break;
            }
          }
          
          if (globalProps) {
            // Update the props directly
            Object.assign(globalProps, {
              widgetId: widget.id,
              widgetType: widget.type,
              widgetProperties: properties,
              isSelected
            });
            
            // Trigger a custom event to notify the micro app of prop changes
            const event = new CustomEvent('qiankunPropsChange', { detail: globalProps });
            window.dispatchEvent(event);
            
            // Also try to use the update method if it exists
            if (microApp && typeof (microApp as any).update === 'function') {
              (microApp as any).update({
                widgetId: widget.id,
                widgetType: widget.type,
                widgetProperties: properties,
                isSelected
              });
            }
            
            console.log(`[MicroAppContainer] Props updated for widget ${widget.id}`);
          } else {
            console.warn(`[MicroAppContainer] Global props object not found for widget ${widget.id}`);
            
            // As a fallback, try to communicate with the micro app via window events
            const fallbackEvent = new CustomEvent('dashboardWidgetPropsChange', { 
              detail: {
                widgetId: widget.id,
                widgetType: widget.type,
                widgetProperties: properties,
                isSelected
              }
            });
            window.dispatchEvent(fallbackEvent);
            console.log(`[MicroAppContainer] Sent fallback props update event for widget ${widget.id}`);
          }
        } catch (error) {
          console.error(`[MicroAppContainer] Error updating props for widget ${widget.id}:`, error);
        }
      };
      
      // Wait a short time to ensure the micro app is fully mounted
      const timeoutId = setTimeout(updateProps, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [properties, isSelected, widget.id, widget.type, microApp]);
  
  return (
    <div 
      ref={containerRef} 
      className={`micro-app-container ${mounted ? 'mounted' : 'not-mounted'}`}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        border: isSelected ? '2px solid #1890ff' : 'none',
        borderRadius: '4px'
      }}
      data-widget-id={widget.id}
      data-widget-type={widget.type}
      data-mounted={mounted ? 'true' : 'false'}
    >
      {!remoteUrl && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#999' 
        }}>
          No remote URL provided for this widget
        </div>
      )}
    </div>
  );
};

export default MicroAppContainer;

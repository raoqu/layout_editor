import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, Divider, Alert } from 'antd';
import { loadMicroApp } from 'qiankun';
import type { MicroApp } from 'qiankun';
import type { WidgetPropertyEditorProps } from '../../types';

/**
 * MicroAppPropertyEditor
 * 
 * A component that uses qiankun to load and render remote property editors for micro-frontend widgets
 */
const MicroAppPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [microApp, setMicroApp] = useState<MicroApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { properties } = widget;
  const remoteUrl = properties.remoteUrl as string;
  
  // Get the property editor path from the widget properties
  // This is set during widget registration from the widget definition
  const propertyEditorPath = properties.propertyEditorPath as string;
  
  useEffect(() => {
    if (!remoteUrl || !containerRef.current) {
      setError('No remote URL provided or container not ready');
      return;
    }
    
    setError(null);
    
    // Get the base entry point from properties (set by WidgetPluginSystem)
    const baseEntry = properties.entry as string;
    
    // Determine the property editor path
    // If propertyEditorPath is specified, use it
    // Otherwise, fall back to the default '/property-editor/' path
    const editorPath = propertyEditorPath || '/property-editor/';
    
    // Construct the entry URL for the property editor
    // If we have a baseEntry, use the same base URL but with the property editor path
    // Otherwise, fall back to the old behavior
    let entryUrl = baseEntry 
      ? `${remoteUrl}${editorPath}` 
      : `${remoteUrl}${editorPath}`;
      
    // If the URL doesn't end with .js or .umd.js, add the extension
    if (!entryUrl.endsWith('.js') && !entryUrl.endsWith('.umd.js')) {
      entryUrl = `${entryUrl}.umd.js`;
      console.log(`[MicroAppPropertyEditor] Added .umd.js extension to entry URL: ${entryUrl}`);
    }
    
    console.log(`[MicroAppPropertyEditor] Loading property editor from ${entryUrl} for widget ${widget.id}`);
    console.log(`[MicroAppPropertyEditor] Widget type: ${widget.type}, Editor path: ${editorPath}`);
    console.log(`[MicroAppPropertyEditor] Base entry: ${baseEntry || 'not specified'}`);
    
    // Load the micro app property editor
    try {
      // Create a consistent name for the micro app property editor
      const microAppName = `property-editor-${widget.id}`;
      
      // Use an entry object with scripts array to explicitly load the UMD bundle
      const entryConfig = {
        scripts: [entryUrl],
        // Provide an empty HTML template
        html: '<div id="app"></div>'
      };
      
      const app = loadMicroApp({
        name: microAppName,
        entry: entryConfig,
        container: containerRef.current,
        props: {
          widgetId: widget.id,
          widgetType: widget.type,
          widgetProperties: properties,
          onPropertyChange
        }
      }, {
        // Additional options for qiankun
        singular: false
      });
      
      console.log(`[MicroAppPropertyEditor] Loading UMD file from: ${remoteUrl}/widget-demo.umd.js`);
      
      setMicroApp(app);
      
      // Unmount the micro app when the component unmounts
      return () => {
        console.log(`[MicroAppPropertyEditor] Unmounting property editor for widget ${widget.id}`);
        if (app) {
          app.unmount();
        }
      };
    } catch (err) {
      setError(`Failed to load property editor: ${err instanceof Error ? err.message : String(err)}`);
      console.error('[MicroAppPropertyEditor] Error loading property editor:', err);
    }
  }, [remoteUrl, widget.id]);
  
  // Update props when they change
  useEffect(() => {
    if (microApp) {
      console.log(`[MicroAppPropertyEditor] Updating props for widget ${widget.id}`);
      
      // Give the micro app some time to initialize before trying to update props
      const updateProps = () => {
        try {
          // Try multiple naming conventions for the global props object
          const possibleNames = [
            `qiankunProps_property-editor-${widget.id}`,
            `qiankunProps_${widget.id}-property-editor`,
            `props_property-editor-${widget.id}`,
            `props_${widget.id}`
          ];
          
          // Find the first available props object
          let globalProps = null;
          for (const name of possibleNames) {
            if ((window as any)[name]) {
              globalProps = (window as any)[name];
              console.log(`[MicroAppPropertyEditor] Found props object with name: ${name}`);
              break;
            }
          }
          
          if (globalProps) {
            // Update the props directly
            Object.assign(globalProps, {
              widgetId: widget.id,
              widgetType: widget.type,
              widgetProperties: properties,
              onPropertyChange
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
                onPropertyChange
              });
            }
            
            console.log(`[MicroAppPropertyEditor] Props updated for widget ${widget.id}`);
          } else {
            console.warn(`[MicroAppPropertyEditor] Global props object not found for widget ${widget.id}`);
            
            // As a fallback, try to communicate with the micro app via window events
            const fallbackEvent = new CustomEvent('dashboardPropertyEditorPropsChange', { 
              detail: {
                widgetId: widget.id,
                widgetType: widget.type,
                widgetProperties: properties,
                onPropertyChange: (key: string, value: any) => {
                  // We need to wrap the callback function since it can't be directly serialized
                  if (onPropertyChange) {
                    onPropertyChange(key, value);
                  }
                }
              }
            });
            window.dispatchEvent(fallbackEvent);
            console.log(`[MicroAppPropertyEditor] Sent fallback props update event for widget ${widget.id}`);
          }
        } catch (error) {
          console.error(`[MicroAppPropertyEditor] Error updating props for widget ${widget.id}:`, error);
        }
      };
      
      // Wait a short time to ensure the micro app is fully mounted
      const timeoutId = setTimeout(updateProps, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [properties, widget.id, widget.type, microApp, onPropertyChange]);
  
  // Basic property editor for when remote one fails or isn't available
  const renderBasicPropertyEditor = () => (
    <Form layout="vertical">
      <Form.Item label="Remote URL">
        <Input
          value={remoteUrl}
          onChange={(e) => onPropertyChange('remoteUrl', e.target.value)}
          placeholder="Enter remote widget URL"
        />
      </Form.Item>
      
      <Form.Item label="Title">
        <Input
          value={properties.title || ''}
          onChange={(e) => onPropertyChange('title', e.target.value)}
          placeholder="Widget title"
        />
      </Form.Item>
    </Form>
  );
  
  return (
    <div className="micro-app-property-editor">
      {error && (
        <Alert
          message="Error Loading Property Editor"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {error && (
        <>
          <Divider>Basic Properties</Divider>
          {renderBasicPropertyEditor()}
        </>
      )}
      
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%',
          minHeight: error ? '200px' : '400px'
        }}
      />
    </div>
  );
};

export default MicroAppPropertyEditor;

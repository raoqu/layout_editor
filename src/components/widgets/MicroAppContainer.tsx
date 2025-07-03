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
  const { properties } = widget;
  const remoteUrl = properties.remoteUrl as string;
  
  useEffect(() => {
    if (!remoteUrl || !containerRef.current) {
      console.error('[MicroAppContainer] No remote URL provided or container not ready');
      return;
    }
    
    console.log(`[MicroAppContainer] Loading micro app from ${remoteUrl} for widget ${widget.id}`);
    
    // Load the micro app
    const app = loadMicroApp({
      name: `widget-${widget.id}`,
      entry: remoteUrl,
      container: containerRef.current,
      props: {
        widgetId: widget.id,
        widgetType: widget.type,
        widgetProperties: properties,
        isSelected
      }
    });
    
    setMicroApp(app);
    
    // Unmount the micro app when the component unmounts
    return () => {
      console.log(`[MicroAppContainer] Unmounting micro app for widget ${widget.id}`);
      if (app) {
        app.unmount();
      }
    };
  }, [remoteUrl, widget.id]);
  
  // Update props when they change
  useEffect(() => {
    if (microApp) {
      console.log(`[MicroAppContainer] Updating props for widget ${widget.id}`);
      // Ensure microApp.update exists before calling it
      if (typeof microApp.update === 'function') {
        microApp.update({
          widgetId: widget.id,
          widgetType: widget.type,
          widgetProperties: properties,
          isSelected
        });
      } else {
        console.warn(`[MicroAppContainer] microApp.update is not a function for widget ${widget.id}`);
      }
    }
  }, [properties, isSelected, widget.id, widget.type, microApp]);
  
  return (
    <div 
      ref={containerRef} 
      className="micro-app-container"
      style={{ 
        width: '100%', 
        height: '100%',
        border: isSelected ? '2px solid #1890ff' : 'none',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
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

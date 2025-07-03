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
  
  useEffect(() => {
    if (!remoteUrl || !containerRef.current) {
      setError('No remote URL provided or container not ready');
      return;
    }
    
    setError(null);
    console.log(`[MicroAppPropertyEditor] Loading property editor from ${remoteUrl}/property-editor for widget ${widget.id}`);
    
    // Load the micro app property editor
    try {
      const app = loadMicroApp({
        name: `property-editor-${widget.id}`,
        entry: `${remoteUrl}/property-editor/`,
        container: containerRef.current,
        props: {
          widgetId: widget.id,
          widgetType: widget.type,
          widgetProperties: properties,
          onPropertyChange
        }
      });
      
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
      // Ensure microApp.update exists before calling it
      if (typeof microApp.update === 'function') {
        microApp.update({
          widgetId: widget.id,
          widgetType: widget.type,
          widgetProperties: properties,
          onPropertyChange
        });
      } else {
        console.warn(`[MicroAppPropertyEditor] microApp.update is not a function for widget ${widget.id}`);
      }
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

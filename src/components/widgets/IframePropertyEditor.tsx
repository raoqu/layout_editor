import React from 'react';
import { Form, Input, ColorPicker } from 'antd';
import type { WidgetPropertyEditorProps } from '../../types';
import { Color } from 'antd/es/color-picker';

const { TextArea } = Input;

/**
 * IframePropertyEditor
 * 
 * Property editor for the IframeWidget
 */
const IframePropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ 
  widget, 
  onPropertyChange 
}) => {
  const { properties } = widget;
  
  const handleColorChange = (propertyName: string) => (color: Color) => {
    onPropertyChange(propertyName, color.toHexString());
  };
  
  return (
    <Form layout="vertical">
      <Form.Item label="Title">
        <Input
          value={properties.title || 'Remote Widget'}
          onChange={(e) => onPropertyChange('title', e.target.value)}
        />
      </Form.Item>
      
      <Form.Item label="Content">
        <TextArea
          value={properties.content || 'This is a remote widget'}
          onChange={(e) => onPropertyChange('content', e.target.value)}
          rows={4}
        />
      </Form.Item>
      
      <Form.Item label="Background Color">
        <ColorPicker
          value={properties.backgroundColor || '#ffffff'}
          onChange={handleColorChange('backgroundColor')}
        />
      </Form.Item>
      
      <Form.Item label="Text Color">
        <ColorPicker
          value={properties.textColor || '#000000'}
          onChange={handleColorChange('textColor')}
        />
      </Form.Item>
      
      {properties.remoteUrl && (
        <Form.Item label="Remote URL (Read-only)">
          <Input
            value={properties.remoteUrl}
            disabled
          />
        </Form.Item>
      )}
    </Form>
  );
};

export default IframePropertyEditor;

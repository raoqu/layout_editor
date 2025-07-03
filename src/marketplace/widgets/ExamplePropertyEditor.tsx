import React from 'react';
import { Form, Input, Switch, InputNumber, ColorPicker } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import type { WidgetPropertyEditorProps } from '../../types';

/**
 * Example Property Editor Template
 * 
 * This is a template for creating property editors for custom widgets
 * in the Dash Designer marketplace.
 */
const ExamplePropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { title, backgroundColor, showCounter, counterStart } = widget.properties;

  const handleChange = (property: string, value: any) => {
    onPropertyChange(property, value);
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Widget Title">
        <Input
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Example Widget Title"
        />
      </Form.Item>

      <Form.Item label="Background Color">
        <ColorPicker
          value={backgroundColor || '#ffffff'}
          onChange={(color) => handleChange('backgroundColor', color.toHexString())}
        />
      </Form.Item>

      <Form.Item label="Show Counter">
        <Switch
          checked={showCounter}
          onChange={(checked) => handleChange('showCounter', checked)}
        />
      </Form.Item>

      {showCounter && (
        <Form.Item label="Counter Start Value">
          <InputNumber
            value={counterStart || 0}
            onChange={(value) => handleChange('counterStart', value)}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}

      <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
          <BulbOutlined /> Tip: This is an example property editor. Customize it to fit your widget's needs.
        </p>
      </div>
    </Form>
  );
};

export default ExamplePropertyEditor;

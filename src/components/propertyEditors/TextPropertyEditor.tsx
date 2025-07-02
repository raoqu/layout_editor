import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import type { WidgetPropertyEditorProps } from '../../types';

const TextPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { content, fontSize, color, align } = widget.properties;

  return (
    <Form layout="vertical">
      <Form.Item label="Content">
        <Input.TextArea
          value={content}
          onChange={(e) => onPropertyChange('content', e.target.value)}
          rows={4}
        />
      </Form.Item>
      <Form.Item label="Font Size">
        <InputNumber
          value={fontSize}
          onChange={(value) => onPropertyChange('fontSize', value)}
          min={8}
          max={72}
        />
      </Form.Item>
      <Form.Item label="Color">
        <Input
          type="color"
          value={color}
          onChange={(e) => onPropertyChange('color', e.target.value)}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item label="Alignment">
        <Select
          value={align}
          onChange={(value) => onPropertyChange('align', value)}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Form>
  );
};

export default TextPropertyEditor;

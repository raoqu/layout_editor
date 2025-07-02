import React from 'react';
import { Form, Input, Switch } from 'antd';
import type { WidgetPropertyEditorProps } from '../../types';

const CardPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { title, bordered } = widget.properties;

  return (
    <Form layout="vertical">
      <Form.Item label="Card Title">
        <Input
          value={title}
          onChange={(e) => onPropertyChange('title', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Bordered" valuePropName="checked">
        <Switch
          checked={bordered}
          onChange={(checked) => onPropertyChange('bordered', checked)}
        />
      </Form.Item>
    </Form>
  );
};

export default CardPropertyEditor;

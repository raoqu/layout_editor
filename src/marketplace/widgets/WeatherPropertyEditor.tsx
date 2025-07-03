import React from 'react';
import { Form, Input, Select, Switch } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import type { WidgetPropertyEditorProps } from '../../types';

const { Option } = Select;

/**
 * Property editor for the Weather Widget
 * This demonstrates how to create a custom property editor for marketplace widgets
 */
const WeatherPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { location, unit, showForecast, title } = widget.properties;

  const handleChange = (property: string, value: any) => {
    onPropertyChange(property, value);
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Widget Title">
        <Input
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Weather Widget Title"
        />
      </Form.Item>

      <Form.Item label="Location">
        <Input
          prefix={<EnvironmentOutlined />}
          value={location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Enter city name"
        />
      </Form.Item>

      <Form.Item label="Temperature Unit">
        <Select
          value={unit}
          onChange={(value) => handleChange('unit', value)}
          style={{ width: '100%' }}
        >
          <Option value="celsius">Celsius (°C)</Option>
          <Option value="fahrenheit">Fahrenheit (°F)</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Show Forecast">
        <Switch
          checked={showForecast}
          onChange={(checked) => handleChange('showForecast', checked)}
        />
      </Form.Item>
    </Form>
  );
};

export default WeatherPropertyEditor;

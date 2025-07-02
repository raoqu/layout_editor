import React from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { WidgetPropertyEditorProps } from '../../types';

const ChartPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onPropertyChange }) => {
  const { chartType, data, xAxisKey, yAxisKey, title } = widget.properties;

  const handleDataChange = (index: number, field: string, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onPropertyChange('data', newData);
  };

  const addDataPoint = () => {
    const newData = [...data, { name: `Item ${data.length + 1}`, value: 0 }];
    onPropertyChange('data', newData);
  };

  const removeDataPoint = (index: number) => {
    const newData = [...data];
    newData.splice(index, 1);
    onPropertyChange('data', newData);
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Chart Title">
        <Input
          value={title}
          onChange={(e) => onPropertyChange('title', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Chart Type">
        <Select
          value={chartType}
          onChange={(value) => onPropertyChange('chartType', value)}
          options={[
            { value: 'bar', label: 'Bar Chart' },
            { value: 'line', label: 'Line Chart' },
            { value: 'pie', label: 'Pie Chart' },
          ]}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item label="X-Axis Key">
        <Input
          value={xAxisKey}
          onChange={(e) => onPropertyChange('xAxisKey', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Y-Axis Key">
        <Input
          value={yAxisKey}
          onChange={(e) => onPropertyChange('yAxisKey', e.target.value)}
        />
      </Form.Item>
      <Form.Item label="Data Points">
        {data.map((item: any, index: number) => (
          <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
            <Form.Item label="Name" style={{ marginBottom: 0 }}>
              <Input
                value={item.name}
                onChange={(e) => handleDataChange(index, 'name', e.target.value)}
                style={{ width: '100px' }}
              />
            </Form.Item>
            <Form.Item label="Value" style={{ marginBottom: 0 }}>
              <Input
                type="number"
                value={item.value}
                onChange={(e) => handleDataChange(index, 'value', Number(e.target.value))}
                style={{ width: '100px' }}
              />
            </Form.Item>
            <MinusCircleOutlined onClick={() => removeDataPoint(index)} />
          </Space>
        ))}
        <Button type="dashed" onClick={addDataPoint} block icon={<PlusOutlined />}>
          Add Data Point
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChartPropertyEditor;

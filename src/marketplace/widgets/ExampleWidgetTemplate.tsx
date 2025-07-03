import React, { useState } from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import type { WidgetComponentProps } from '../../types';

const { Title, Text, Paragraph } = Typography;

/**
 * Example Widget Template
 * 
 * This is a template for creating custom widgets for the Dash Designer marketplace.
 * Developers can use this as a starting point for their own widgets.
 */
const ExampleWidgetTemplate: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const { title, backgroundColor, showCounter, counterStart } = widget.properties;
  const [counter, setCounter] = useState(counterStart || 0);

  const incrementCounter = () => {
    setCounter((prev: number) => prev + 1);
  };

  return (
    <Card
      title={title || null}
      headStyle={{ display: title ? 'block' : 'none' }}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : '1px solid #f0f0f0',
        backgroundColor: backgroundColor || '#ffffff',
      }}
      bodyStyle={{ padding: '16px', height: title ? 'calc(100% - 57px)' : '100%' }}
    >
      <div className="example-widget-content">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            <Text strong>This is an example widget template</Text> that demonstrates how to create
            custom widgets for the Dash Designer marketplace.
          </Paragraph>
          
          {showCounter && (
            <>
              <Divider />
              <div style={{ textAlign: 'center' }}>
                <Title level={3}>{counter}</Title>
                <Button type="primary" onClick={incrementCounter}>
                  Increment Counter
                </Button>
              </div>
            </>
          )}
          
          <Divider />
          
          <div style={{ fontSize: '12px', color: '#888' }}>
            <BulbOutlined /> Tip: Edit this widget's properties to customize it
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default ExampleWidgetTemplate;

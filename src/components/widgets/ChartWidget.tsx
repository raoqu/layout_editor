import React from 'react';
import { Card } from 'antd';
import type { WidgetComponentProps } from '../../types';

// In a real application, you would use a charting library like recharts
// For this example, we'll create a placeholder
const ChartWidget: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const { chartType, data, xAxisKey, yAxisKey, title } = widget.properties;

  return (
    <Card 
      title={title || null}
      headStyle={{ display: title ? 'block' : 'none' }}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : '1px solid #f0f0f0',
      }}
      bodyStyle={{ height: title ? 'calc(100% - 57px)' : '100%', padding: '8px' }}
    >
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
      }}>
        <div>{chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          X: {xAxisKey}, Y: {yAxisKey}, Items: {data.length}
        </div>
        {/* In a real app, you would render an actual chart here */}
        <div style={{ 
          marginTop: '10px', 
          display: 'flex', 
          height: '60%', 
          width: '80%', 
          alignItems: 'flex-end',
          justifyContent: 'space-around',
        }}>
          {data.map((item: any, index: number) => (
            <div 
              key={index} 
              style={{ 
                width: `${100 / data.length / 2}%`, 
                height: `${item.value * 3}px`, 
                backgroundColor: '#1890ff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ marginTop: '5px', fontSize: '10px' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          width: '80%', 
          justifyContent: 'space-around',
          marginTop: '5px',
        }}>
          {data.map((item: any, index: number) => (
            <div key={index} style={{ fontSize: '10px' }}>{item.name}</div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ChartWidget;

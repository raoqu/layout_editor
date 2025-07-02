import React from 'react';
import { Typography } from 'antd';
import type { WidgetComponentProps } from '../../types';

const { Paragraph } = Typography;

const TextWidget: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const { content, fontSize, color, align } = widget.properties;

  return (
    <div 
      style={{ 
        padding: '8px', 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        textAlign: align as any,
      }}
    >
      <Paragraph
        style={{
          fontSize: `${fontSize}px`,
          color,
          margin: 0,
          width: '100%',
        }}
      >
        {content}
      </Paragraph>
    </div>
  );
};

export default TextWidget;

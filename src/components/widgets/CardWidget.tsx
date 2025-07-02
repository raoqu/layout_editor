import React from 'react';
import { Card } from 'antd';
import type { WidgetComponentProps } from '../../types';
import type { ContainerWidget } from '../../types';
import DashboardGrid from '../DashboardGrid';

const CardWidget: React.FC<WidgetComponentProps> = ({ widget, isEditing, isSelected }) => {
  const containerWidget = widget as ContainerWidget;
  const { title, bordered } = containerWidget.properties;

  return (
    <Card
      title={title}
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : undefined,
      }}
      styles={{
        body: { 
          height: 'calc(100% - 57px)', 
          padding: '0',
          overflow: 'hidden',
        }
      }}
    >
      {containerWidget.children && (
        <div style={{ height: '100%', width: '100%' }}>
          <DashboardGrid
            layout={containerWidget.children.layout}
            isEditing={isEditing}
            isNested={true}
            parentId={containerWidget.id}
          />
        </div>
      )}
    </Card>
  );
};

export default CardWidget;

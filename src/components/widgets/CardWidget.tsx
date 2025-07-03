import React from 'react';
import { Card } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import './CardWidget.css';
import type { WidgetComponentProps } from '../../types';
import type { ContainerWidget } from '../../types';
import DashboardGrid from '../DashboardGrid';
import DashboardPreview from '../DashboardPreview';

const CardWidget: React.FC<WidgetComponentProps> = ({ widget, isEditing, isSelected }) => {
  const containerWidget = widget as ContainerWidget;
  const { title, bordered } = containerWidget.properties;

  return (
    <Card
      title={title || null}
      headStyle={{ display: title ? 'block' : 'none' }}
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '1px dashed #1890ff' : undefined,
      }}
      styles={{
        body: { 
          padding: '8px', 
          height: title ? 'calc(100% - 57px)' : '100%',
          overflow: 'hidden',
        },
        header: {
          padding: '0 16px'
        }
      }}
    >
      {containerWidget.children && (
        <div 
          className="card-nested-grid"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {containerWidget.children.layout.layouts.length > 0 ? (
            isEditing ? (
              <DashboardGrid
                layout={containerWidget.children.layout}
                isEditing={true}
                isNested={true}
                parentId={containerWidget.id}
              />
            ) : (
              <DashboardPreview
                layout={containerWidget.children.layout}
                isNested={true}
              />
            )
          ) : isEditing ? (
            <div className="card-empty-state">
              <AppstoreOutlined className="card-empty-state-icon" />
              <div className="card-empty-state-text">Add widgets using the + button</div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
};

export default CardWidget;

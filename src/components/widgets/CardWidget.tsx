import React, { useState, useContext } from 'react';
import { Card, Button, Dropdown } from 'antd';
import { PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import './CardWidget.css';
import type { WidgetComponentProps } from '../../types';
import type { ContainerWidget } from '../../types';
import DashboardGrid from '../DashboardGrid';
import DashboardPreview from '../DashboardPreview';
import { DashboardContext } from '../../contexts/DashboardContext';
import widgetRegistry from './WidgetRegistry';

const CardWidget: React.FC<WidgetComponentProps> = ({ widget, isEditing, isSelected }) => {
  const containerWidget = widget as ContainerWidget;
  const { title, bordered } = containerWidget.properties;
  const { addWidget } = useContext(DashboardContext);
  const [showToolbar, setShowToolbar] = useState(false);
  
  const handleAddWidget = (widgetType: string) => {
    addWidget(widgetType, undefined, containerWidget.id);
  };
  
  // Create menu items for each available widget type
  const widgetMenuItems = Object.values(widgetRegistry).map(widgetDef => ({
    key: widgetDef.type,
    label: widgetDef.name,
    icon: widgetDef.icon,
    onClick: () => handleAddWidget(widgetDef.type)
  }));

  const titleContent = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title}</span>
      {isEditing && (
        <Dropdown 
          menu={{ items: widgetMenuItems }} 
          trigger={['click']}
          onOpenChange={(open) => setShowToolbar(open)}
        >
          <Button 
            type="text" 
            size="small" 
            icon={<PlusOutlined />}
            className={showToolbar ? 'active-toolbar-btn' : ''}
          >
            Add Widget
          </Button>
        </Dropdown>
      )}
    </div>
  );

  return (
    <Card
      title={title ||  null}
      headStyle={{ display: title || isEditing ? 'block' : 'none' }}
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '1px dashed #1890ff' : undefined,
      }}
      styles={{
        body: { 
          padding: '8px', 
          height: (title || isEditing) ? 'calc(100% - 57px)' : '100%',
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
            // This prevents the card from being dragged when interacting with its contents
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
              <div className="card-empty-state-text">Click "Add Widget" to add content</div>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
};

export default CardWidget;

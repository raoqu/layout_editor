import React, { useState, useContext } from 'react';
import { Dropdown, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DashboardContext } from '../../contexts/DashboardContext';
import widgetRegistry from './WidgetRegistry';
import '../../styles/widget-actions.css';

interface AddWidgetButtonProps {
  containerId: string;
}

const AddWidgetButton: React.FC<AddWidgetButtonProps> = ({ containerId }) => {
  const { addWidget } = useContext(DashboardContext);
  const [open, setOpen] = useState(false);
  
  const handleAddWidget = (widgetType: string) => {
    // Position is undefined to let the context determine the best bottom position
    addWidget(widgetType, undefined, containerId);
    message.success(`Added ${widgetType} widget to bottom`);
    setOpen(false);
  };
  
  // Create menu items for each available widget type
  const widgetMenuItems = Object.values(widgetRegistry).map(widgetDef => ({
    key: widgetDef.type,
    label: widgetDef.name,
    icon: widgetDef.icon,
    onClick: () => handleAddWidget(widgetDef.type)
  }));

  return (
    <Dropdown 
      menu={{ items: widgetMenuItems }}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      overlayClassName="add-widget-dropdown"
    >
      <div 
        className="add-widget-button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        title="Add widget to container"
      >
        <PlusOutlined />
      </div>
    </Dropdown>
  );
};

export default AddWidgetButton;

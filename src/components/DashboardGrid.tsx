import React, { useContext } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { DashboardLayout, WidgetLayoutItem } from '../types';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import { DashboardContext } from '../contexts/DashboardContext';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  layout: DashboardLayout;
  isEditing: boolean;
  isNested?: boolean;
  parentId?: string;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  layout, 
  isEditing, 
  isNested = false,
  parentId
}) => {
  const { 
    selectedWidgetId, 
    setSelectedWidgetId, 
    updateLayout, 
    updateNestedLayout 
  } = useContext(DashboardContext);

  const handleLayoutChange = (newLayoutItems: any[]) => {
    const updatedLayoutItems = newLayoutItems.map((item) => {
      const existingItem = layout.layouts.find((layoutItem) => layoutItem.i === item.i);
      if (existingItem) {
        return {
          ...item,
          widget: existingItem.widget,
        };
      }
      return item;
    });

    const updatedLayout = {
      ...layout,
      layouts: updatedLayoutItems as WidgetLayoutItem[],
    };

    if (isNested && parentId) {
      updateNestedLayout(parentId, updatedLayout);
    } else {
      updateLayout(updatedLayout);
    }
  };

  const handleWidgetSelect = (widgetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWidgetId(widgetId);
  };

  return (
    <div 
      style={{ 
        height: '100%', 
        width: '100%', 
        background: isNested ? 'transparent' : '#f0f2f5',
        padding: isNested ? 0 : 16,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedWidgetId(null);
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout.layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: layout.settings.cols, md: layout.settings.cols, sm: layout.settings.cols, xs: layout.settings.cols, xxs: 1 }}
        rowHeight={layout.settings.rowHeight}
        containerPadding={layout.settings.containerPadding}
        margin={layout.settings.margin}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        style={{ height: '100%' }}
        compactType={null}
        preventCollision={true}
      >
        {layout.layouts.map((item) => {
          const WidgetComponent = getWidgetDefinition(item.widget.type).component;
          return (
            <div 
              key={item.i} 
              onClick={(e) => handleWidgetSelect(item.i, e)}
              style={{ 
                overflow: 'hidden',
                cursor: isEditing ? 'move' : 'default',
              }}
            >
              <WidgetComponent
                widget={item.widget}
                isEditing={isEditing}
                isSelected={selectedWidgetId === item.i}
              />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;

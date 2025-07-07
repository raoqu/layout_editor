import React, { useContext, useState, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
// Import the CSS directly from node_modules
import '../styles/grid-layout.css';
import '../styles/widget-actions.css';
import { DashboardContext } from '../contexts/DashboardContext';
import type { WidgetLayoutItem, DashboardLayout } from '../types';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import { optimizeLayoutForDragging } from '../utils/layoutUtils';
import './DashboardGrid.css';

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
  
  // Track drag state to handle compaction appropriately
  const [isDragging, setIsDragging] = useState(false);
  // Store original layout to restore positions if needed
  const originalLayoutRef = useRef<WidgetLayoutItem[]>([]);
  // Track which widget is being dragged
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // Save original layout when component mounts or layout changes
  React.useEffect(() => {
    if (!isDragging) {
      originalLayoutRef.current = JSON.parse(JSON.stringify(layout.layouts));
    }
  }, [layout.layouts, isDragging]);
  
  // Handle drag start - save original positions
  const handleDragStart = (_layouts: any[], item: any) => {
    setIsDragging(true);
    setDraggedWidgetId(item.i);
    // Save the original layout at drag start
    originalLayoutRef.current = JSON.parse(JSON.stringify(layout.layouts));
  };
  
  // Handle drag - update layout during drag with smart positioning
  const handleDrag = () => {
    // We'll handle layout changes in handleLayoutChange
    // This is just a placeholder to connect the event
  };
  
  // Handle drag stop - apply final layout
  const handleDragStop = () => {
    setIsDragging(false);
    setDraggedWidgetId(null);
    // Final layout will be applied by handleLayoutChange
  };

  const handleLayoutChange = (newLayoutItems: any[]) => {
    // During drag operations, we want to be smart about how we update positions
    if (isDragging && draggedWidgetId) {
      const originalLayouts = originalLayoutRef.current;
      const draggedItem = newLayoutItems.find(item => item.i === draggedWidgetId);
      
      if (draggedItem) {
        // Use the optimizeLayoutForDragging utility to create a layout that minimizes position changes
        const optimizedLayout = optimizeLayoutForDragging(
          newLayoutItems,
          originalLayouts,
          draggedWidgetId
        );
        
        const updatedLayout = {
          ...layout,
          layouts: optimizedLayout as WidgetLayoutItem[],
        };
        
        if (isNested && parentId) {
          updateNestedLayout(parentId, updatedLayout);
        } else {
          updateLayout(updatedLayout);
        }
        return;
      }
    }
    
    // Standard layout update for non-drag operations or when not near original position
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
      className={isEditing ? 'editing-mode' : ''}
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
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        style={{ height: '100%' }}
        compactType="horizontal"
        preventCollision={false}
        resizeHandles={['se']}
        draggableHandle=".widget-drag-area"
      >
        {layout.layouts.map((item) => {
          const WidgetComponent = getWidgetDefinition(item.widget.type).component;
          return (
            <div 
              key={item.i} 
              onClick={(e) => handleWidgetSelect(item.i, e)}
              className={`widget-container ${selectedWidgetId === item.i ? 'selected' : ''}`}
              style={{ 
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div className="widget-content">
                <WidgetComponent
                  widget={item.widget}
                  isEditing={isEditing}
                  isSelected={selectedWidgetId === item.i}
                />
              </div>
              {isEditing && (
                <div className="widget-overlay">
                  <div className="widget-drag-area" data-widget-type={item.widget.type} data-widget-id={item.i}>
                    {/* Add widget button removed - now using sidebar to add widgets */}
                  </div>
                  <div className="widget-resize-area" />
                </div>
              )}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;

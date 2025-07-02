import React, { useContext, useState, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
// Import the CSS directly from node_modules
import '../styles/grid-layout.css';
import type { DashboardLayout, WidgetLayoutItem } from '../types';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import { DashboardContext } from '../contexts/DashboardContext';
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
        // Create a new layout that minimizes position changes for non-dragged widgets
        const optimizedLayout = newLayoutItems.map(newItem => {
          // Keep the dragged item at its new position
          if (newItem.i === draggedWidgetId) {
            const originalItem = originalLayouts.find((item: WidgetLayoutItem) => item.i === draggedWidgetId);
            return {
              ...newItem,
              widget: originalItem ? originalItem.widget : newItem.widget
            };
          }
          
          // For non-dragged items, find the closest valid position to their original position
          const originalItem = originalLayouts.find((item: WidgetLayoutItem) => item.i === newItem.i);
          if (originalItem) {
            // Check if the new position is significantly different from the original
            const xDiff = Math.abs(newItem.x - originalItem.x);
            const yDiff = Math.abs(newItem.y - originalItem.y);
            
            // If the position has changed significantly, try to find a better position
            if (xDiff > 1 || yDiff > 1) {
              // Start from the original position and find the nearest valid position
              // that doesn't overlap with the dragged item or other already placed items
              // For simplicity in this implementation, we'll just prefer positions
              // that are closer to the original y-coordinate when possible
              if (yDiff > xDiff && newItem.y !== originalItem.y) {
                // Try to keep the original y-coordinate if possible
                const itemAtOriginalY = newLayoutItems.find(item => 
                  item !== newItem && 
                  item.i !== draggedWidgetId && 
                  item.y === originalItem.y && 
                  ((item.x <= originalItem.x && item.x + item.w > originalItem.x) || 
                   (item.x >= originalItem.x && originalItem.x + originalItem.w > item.x))
                );
                
                if (!itemAtOriginalY) {
                  return {
                    ...newItem,
                    y: originalItem.y,
                    widget: originalItem.widget
                  };
                }
              }
            }
            
            return {
              ...newItem,
              widget: originalItem.widget
            };
          }
          
          return newItem;
        });
        
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
                  <div className="widget-drag-area" />
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

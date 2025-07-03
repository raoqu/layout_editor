import type { WidgetLayoutItem } from '../types';

/**
 * Finds the bottom-most Y position in a layout
 * @param layouts Array of layout items to analyze
 * @returns The maximum Y position (bottom edge) found in the layout
 */
export const findBottomPosition = (layouts: WidgetLayoutItem[]): number => {
  if (!layouts || layouts.length === 0) {
    return 0;
  }
  
  let maxY = 0;
  layouts.forEach(item => {
    const itemBottom = item.y + item.h;
    if (itemBottom > maxY) {
      maxY = itemBottom;
    }
  });
  
  return maxY;
};

/**
 * Creates a new layout item positioned at the bottom of the existing layout
 * If there's enough space on the right side, it will be placed there
 * @param layouts Existing layout items
 * @param widgetId ID for the new widget
 * @param widget The widget object to add
 * @param w Width of the widget
 * @param h Height of the widget
 * @param position Optional position override
 * @returns A new layout item positioned appropriately
 */
export const createBottomPositionedItem = (
  layouts: WidgetLayoutItem[],
  widgetId: string,
  widget: any,
  w: number,
  h: number,
  position?: { x: number, y: number }
): WidgetLayoutItem => {
  // If position is explicitly provided, use it
  if (position) {
    return {
      i: widgetId,
      x: position.x,
      y: position.y,
      w,
      h,
      widget,
    };
  }
  
  // If there are no layouts yet, place at the top-left
  if (!layouts || layouts.length === 0) {
    return {
      i: widgetId,
      x: 0,
      y: 0,
      w,
      h,
      widget,
    };
  }
  
  // Default grid width (12 columns is standard)
  const gridWidth = 12;
  
  // Group items by their Y position to identify rows
  const rowMap = new Map<number, WidgetLayoutItem[]>();
  
  layouts.forEach(item => {
    // Round to nearest integer to handle floating point issues
    const rowY = Math.round(item.y);
    if (!rowMap.has(rowY)) {
      rowMap.set(rowY, []);
    }
    rowMap.get(rowY)!.push(item);
  });
  
  // Sort rows by Y position (top to bottom)
  const sortedRows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  
  // Find the bottom-most row
  const bottomRow = sortedRows.length > 0 ? sortedRows[sortedRows.length - 1] : null;
  
  // If we have a bottom row, check if there's space on the right
  if (bottomRow) {
    const [bottomY, itemsInBottomRow] = bottomRow;
    
    // Find the rightmost edge in the bottom row
    let rightmostX = 0;
    itemsInBottomRow.forEach(item => {
      const itemRightEdge = item.x + item.w;
      rightmostX = Math.max(rightmostX, itemRightEdge);
    });
    
    // Calculate available width on the right
    const availableWidth = gridWidth - rightmostX;
    
    // If there's enough space on the right for this widget, place it there
    if (availableWidth >= w) {
      return {
        i: widgetId,
        x: rightmostX,
        y: bottomY,
        w,
        h,
        widget,
      };
    }
  }
  
  // If we don't have a bottom row or there's not enough space on the right,
  // find the bottom-most Y position and place the widget at a new row
  const bottomY = findBottomPosition(layouts);
  
  return {
    i: widgetId,
    x: 0,
    y: bottomY,
    w,
    h,
    widget,
  };
};

/**
 * Optimizes layout during drag operations to minimize unwanted position changes
 * @param newLayoutItems The new layout items from the grid
 * @param originalLayouts The original layout before dragging
 * @param draggedWidgetId The ID of the widget being dragged
 * @returns Optimized layout items that preserve original positions when possible
 */
export const optimizeLayoutForDragging = (
  newLayoutItems: any[],
  originalLayouts: WidgetLayoutItem[],
  draggedWidgetId: string
): any[] => {
  const draggedItem = newLayoutItems.find(item => item.i === draggedWidgetId);
  
  if (!draggedItem) {
    return newLayoutItems;
  }
  
  // Create a new layout that minimizes position changes for non-dragged widgets
  return newLayoutItems.map(newItem => {
    // Keep the dragged item at its new position
    if (newItem.i === draggedWidgetId) {
      const originalItem = originalLayouts.find(item => item.i === draggedWidgetId);
      return {
        ...newItem,
        widget: originalItem ? originalItem.widget : newItem.widget
      };
    }
    
    // For non-dragged items, find the closest valid position to their original position
    const originalItem = originalLayouts.find(item => item.i === newItem.i);
    if (originalItem) {
      // Check if the new position is significantly different from the original
      const xDiff = Math.abs(newItem.x - originalItem.x);
      const yDiff = Math.abs(newItem.y - originalItem.y);
      
      // If the position has changed significantly, try to find a better position
      if (xDiff > 1 || yDiff > 1) {
        // Start from the original position and find the nearest valid position
        // that doesn't overlap with the dragged item or other already placed items
        // For simplicity, we'll just prefer positions closer to the original y-coordinate when possible
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
};

/**
 * Recursively finds a widget in a layout by its ID
 * @param layouts Array of layout items to search
 * @param widgetId ID of the widget to find
 * @returns The found layout item or undefined
 */
export const findWidgetInLayout = (layouts: WidgetLayoutItem[], widgetId: string): WidgetLayoutItem | undefined => {
  // First check direct children
  const directMatch = layouts.find(item => item.i === widgetId);
  if (directMatch) {
    return directMatch;
  }
  
  // Then check nested containers
  for (const item of layouts) {
    const containerWidget = item.widget as any;
    if (containerWidget.children && containerWidget.children.layout) {
      const nestedMatch = findWidgetInLayout(containerWidget.children.layout.layouts, widgetId);
      if (nestedMatch) {
        return nestedMatch;
      }
    }
  }
  
  return undefined;
};

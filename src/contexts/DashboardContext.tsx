import React, { createContext, useState, useCallback } from 'react';
import type { DashboardState, DashboardLayout, ContainerWidget, WidgetLayoutItem } from '../types';
import { createWidget } from '../components/widgets/WidgetRegistry';
import { v4 as uuidv4 } from 'uuid';

interface DashboardContextProps {
  dashboardState: DashboardState;
  selectedWidgetId: string | null;
  setSelectedWidgetId: (id: string | null) => void;
  toggleEditMode: () => void;
  addWidget: (widgetType: string, position?: { x: number, y: number }) => void;
  removeWidget: (widgetId: string) => void;
  updateLayout: (newLayout: DashboardLayout) => void;
  updateWidgetProperty: (widgetId: string, propertyName: string, value: any) => void;
  updateNestedLayout: (parentId: string, newLayout: DashboardLayout) => void;
  exportDashboard: () => string;
  importDashboard: (jsonData: string) => void;
}

const initialDashboardState: DashboardState = {
  layout: {
    layouts: [],
    settings: {
      cols: 12,
      rowHeight: 30,
      containerPadding: [10, 10],
      margin: [10, 10],
    },
  },
  editMode: false,
  selectedWidgetId: null,
};

export const DashboardContext = createContext<DashboardContextProps>({} as DashboardContextProps);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(initialDashboardState);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const toggleEditMode = useCallback(() => {
    setDashboardState((prevState) => ({
      ...prevState,
      editMode: !prevState.editMode,
    }));
    setSelectedWidgetId(null);
  }, []);

  const addWidget = useCallback((widgetType: string, position?: { x: number, y: number }) => {
    const widgetId = uuidv4();
    const newWidget = createWidget(widgetType, widgetId);
    
    // Find a suitable position for the new widget
    const x = position?.x ?? 0;
    const y = position?.y ?? 0;
    const w = widgetType === 'card' ? 6 : widgetType === 'table' ? 6 : 4;
    const h = widgetType === 'card' ? 4 : widgetType === 'table' ? 4 : 3;

    const newLayoutItem: WidgetLayoutItem = {
      i: widgetId,
      x,
      y,
      w,
      h,
      widget: newWidget,
    };

    setDashboardState((prevState) => ({
      ...prevState,
      layout: {
        ...prevState.layout,
        layouts: [...prevState.layout.layouts, newLayoutItem],
      },
    }));

    setSelectedWidgetId(widgetId);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setDashboardState((prevState) => ({
      ...prevState,
      layout: {
        ...prevState.layout,
        layouts: prevState.layout.layouts.filter((item) => item.i !== widgetId),
      },
    }));

    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
  }, [selectedWidgetId]);

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setDashboardState((prevState) => {
      // Ensure we preserve widget data when updating layout
      const updatedLayouts = newLayout.layouts.map(item => {
        const existingItem = prevState.layout.layouts.find(li => li.i === item.i);
        if (existingItem) {
          return {
            ...item,
            widget: existingItem.widget
          };
        }
        return item;
      });
      
      return {
        ...prevState,
        layout: {
          ...newLayout,
          layouts: updatedLayouts
        },
      };
    });
  }, []);

  const findWidgetInLayout = (layouts: WidgetLayoutItem[], widgetId: string): WidgetLayoutItem | null => {
    for (const item of layouts) {
      if (item.i === widgetId) {
        return item;
      }
      
      // Check if this is a container widget with nested layouts
      const widget = item.widget as any;
      if (widget.children?.layout?.layouts) {
        const nestedResult = findWidgetInLayout(widget.children.layout.layouts, widgetId);
        if (nestedResult) {
          return nestedResult;
        }
      }
    }
    return null;
  };

  const updateWidgetProperty = useCallback((widgetId: string, propertyName: string, value: any) => {
    setDashboardState((prevState) => {
      // Create a deep copy of the layouts
      const newLayouts = JSON.parse(JSON.stringify(prevState.layout.layouts));
      
      // Find the widget in the layout (including nested layouts)
      const layoutItem = findWidgetInLayout(newLayouts, widgetId);
      
      if (layoutItem) {
        // Update the property
        layoutItem.widget.properties[propertyName] = value;
      }
      
      return {
        ...prevState,
        layout: {
          ...prevState.layout,
          layouts: newLayouts,
        },
      };
    });
  }, []);

  const updateNestedLayout = useCallback((parentId: string, newLayout: DashboardLayout) => {
    setDashboardState((prevState) => {
      // Create a deep copy of the layouts
      const newLayouts = JSON.parse(JSON.stringify(prevState.layout.layouts));
      
      // Find the parent container widget
      for (const item of newLayouts) {
        if (item.i === parentId) {
          const containerWidget = item.widget as ContainerWidget;
          containerWidget.children.layout = newLayout;
          break;
        }
      }
      
      return {
        ...prevState,
        layout: {
          ...prevState.layout,
          layouts: newLayouts,
        },
      };
    });
  }, []);

  const exportDashboard = useCallback(() => {
    return JSON.stringify(dashboardState.layout, null, 2);
  }, [dashboardState.layout]);

  const importDashboard = useCallback((jsonData: string) => {
    try {
      const importedLayout = JSON.parse(jsonData);
      setDashboardState((prevState) => ({
        ...prevState,
        layout: importedLayout,
      }));
    } catch (error) {
      console.error('Failed to import dashboard:', error);
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        selectedWidgetId,
        setSelectedWidgetId,
        toggleEditMode,
        addWidget,
        removeWidget,
        updateLayout,
        updateWidgetProperty,
        updateNestedLayout,
        exportDashboard,
        importDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

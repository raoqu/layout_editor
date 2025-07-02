import type { ReactNode } from 'react';
import type { Layout } from 'react-grid-layout';

// Base widget type
export interface WidgetBase {
  id: string;
  type: string;
  title: string;
  properties: Record<string, any>;
}

// Layout item with additional widget data
export interface WidgetLayoutItem extends Layout {
  i: string; // Widget ID
  widget: WidgetBase;
}

// Dashboard layout type
export interface DashboardLayout {
  layouts: WidgetLayoutItem[];
  settings: {
    cols: number;
    rowHeight: number;
    containerPadding: [number, number];
    margin: [number, number];
  };
}

// Container widget that can hold other widgets
export interface ContainerWidget extends WidgetBase {
  type: 'container';
  children: {
    layout: DashboardLayout;
  };
}

// Widget registry for available widget types
export interface WidgetDefinition {
  type: string;
  name: string;
  icon: ReactNode;
  defaultSize: [number, number]; // [width, height]
  defaultProperties: Record<string, any>;
  component: React.ComponentType<WidgetComponentProps>;
  propertyEditor?: React.ComponentType<WidgetPropertyEditorProps>;
  isContainer?: boolean;
}

// Props passed to widget components
export interface WidgetComponentProps {
  widget: WidgetBase | ContainerWidget;
  onPropertyChange?: (propertyName: string, value: any) => void;
  isEditing: boolean;
  isSelected: boolean;
}

// Props passed to property editors
export interface WidgetPropertyEditorProps {
  widget: WidgetBase | ContainerWidget;
  onPropertyChange: (propertyName: string, value: any) => void;
}

// Dashboard state
export interface DashboardState {
  layout: DashboardLayout;
  editMode: boolean;
  selectedWidgetId: string | null;
}

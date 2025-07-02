import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { DashboardLayout } from '../types';
import { getWidgetDefinition } from './widgets/WidgetRegistry';
import '../styles/grid-layout.css';
import '../styles/preview.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardPreviewProps {
  layout: DashboardLayout;
  isNested?: boolean;
}

const DashboardPreview: React.FC<DashboardPreviewProps> = ({ 
  layout, 
  isNested = false
}) => {
  return (
    <div 
      className="preview-mode"
      style={{ 
        height: '100%', 
        width: '100%', 
        background: isNested ? 'transparent' : '#f0f2f5',
        padding: isNested ? 0 : 16,
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
        isDraggable={false}
        isResizable={false}
        style={{ height: '100%' }}
        compactType="horizontal"
      >
        {layout.layouts.map((item) => {
          const WidgetComponent = getWidgetDefinition(item.widget.type).component;
          return (
            <div 
              key={item.i} 
              className="widget-container preview-widget"
              style={{ 
                overflow: 'hidden',
              }}
            >
              <div className="widget-content">
                <WidgetComponent
                  widget={item.widget}
                  isEditing={false}
                  isSelected={false}
                />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardPreview;

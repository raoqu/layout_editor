import { AppstoreOutlined, BarChartOutlined, TableOutlined, CreditCardOutlined, LineChartOutlined } from '@ant-design/icons';
import type { WidgetDefinition } from '../../types';
import TextWidget from './TextWidget.tsx';
import ChartWidget from './ChartWidget.tsx';
import TableWidget from './TableWidget.tsx';
import CardWidget from './CardWidget.tsx';
import TextPropertyEditor from '../propertyEditors/TextPropertyEditor.tsx';
import ChartPropertyEditor from '../propertyEditors/ChartPropertyEditor.tsx';
import TablePropertyEditor from '../propertyEditors/TablePropertyEditor.tsx';
import CardPropertyEditor from '../propertyEditors/CardPropertyEditor.tsx';

// Registry of all available widgets
const widgetRegistry: Record<string, WidgetDefinition> = {
  text: {
    type: 'text',
    name: 'Text',
    icon: <AppstoreOutlined />,
    defaultSize: [2, 1],
    defaultProperties: {
      content: 'Text content',
      fontSize: 14,
      color: '#000000',
      align: 'left',
    },
    component: TextWidget,
    propertyEditor: TextPropertyEditor,
  },
  chart: {
    type: 'chart',
    name: 'Chart',
    icon: <BarChartOutlined />,
    defaultSize: [4, 3],
    defaultProperties: {
      chartType: 'bar',
      data: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
      ],
      xAxisKey: 'name',
      yAxisKey: 'value',
      title: 'Chart Title',
    },
    component: ChartWidget,
    propertyEditor: ChartPropertyEditor,
  },
  lineChart: {
    type: 'lineChart',
    name: 'Line Chart',
    icon: <LineChartOutlined />,
    defaultSize: [4, 3],
    defaultProperties: {
      chartType: 'line',
      data: [
        { name: 'Jan', value: 10 },
        { name: 'Feb', value: 20 },
        { name: 'Mar', value: 15 },
        { name: 'Apr', value: 25 },
      ],
      xAxisKey: 'name',
      yAxisKey: 'value',
      title: 'Line Chart Title',
    },
    component: ChartWidget,
    propertyEditor: ChartPropertyEditor,
  },
  table: {
    type: 'table',
    name: 'Table',
    icon: <TableOutlined />,
    defaultSize: [6, 4],
    defaultProperties: {
      columns: [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Age', dataIndex: 'age', key: 'age' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
      ],
      dataSource: [
        { key: '1', name: 'John Brown', age: 32, address: 'New York No. 1 Lake Park' },
        { key: '2', name: 'Jim Green', age: 42, address: 'London No. 1 Lake Park' },
      ],
    },
    component: TableWidget,
    propertyEditor: TablePropertyEditor,
  },
  card: {
    type: 'card',
    name: 'Card',
    icon: <CreditCardOutlined />,
    defaultSize: [6, 4],
    defaultProperties: {
      title: 'Card Title',
      bordered: true,
    },
    component: CardWidget,
    propertyEditor: CardPropertyEditor,
    isContainer: true,
  },
};

export default widgetRegistry;

// Helper function to get a widget definition by type
export const getWidgetDefinition = (type: string): WidgetDefinition => {
  return widgetRegistry[type] || widgetRegistry.text;
};

// Helper function to create a new widget instance
export const createWidget = (type: string, id: string): any => {
  const definition = getWidgetDefinition(type);
  const widget = {
    id,
    type,
    title: definition.name,
    properties: { ...definition.defaultProperties },
  };

  // If it's a container, add empty children layout
  if (definition.isContainer) {
    return {
      ...widget,
      children: {
        layout: {
          layouts: [],
          settings: {
            cols: 12,
            rowHeight: 30,
            containerPadding: [10, 10],
            margin: [10, 10],
          },
        },
      },
    };
  }

  return widget;
};

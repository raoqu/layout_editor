import { useContext, useState } from 'react';
import { Layout, Menu, Button, Drawer, Modal, Input, message } from 'antd';
import {
  EditOutlined,
  ImportOutlined,
  ExportOutlined,
  DeleteOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { DashboardContext } from '../contexts/DashboardContext';
import DashboardGrid from './DashboardGrid';
import widgetRegistry, { getWidgetDefinition } from './widgets/WidgetRegistry';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

const DashboardDesigner: React.FC = () => {
  const {
    dashboardState,
    selectedWidgetId,
    toggleEditMode,
    addWidget,
    removeWidget,
    updateWidgetProperty,
    exportDashboard,
    importDashboard,
  } = useContext(DashboardContext);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');

  // Helper function to find a widget in the layout
  const findWidgetInLayout = (layouts: any[], widgetId: string): any => {
    for (const item of layouts) {
      if (item.i === widgetId) {
        return { widget: item.widget, type: item.widget.type, id: item.i };
      }
      
      // Check if this is a container widget with nested layouts
      if (item.widget.children?.layout?.layouts) {
        const nestedResult = findWidgetInLayout(item.widget.children.layout.layouts, widgetId);
        if (nestedResult) {
          return nestedResult;
        }
      }
    }
    return null;
  };

  const handleAddWidget = (widgetType: string) => {
    // Check if a card widget is currently selected
    if (selectedWidgetId) {
      const selectedWidget = findWidgetInLayout(dashboardState.layout.layouts, selectedWidgetId);
      
      // If the selected widget is a card, add the new widget to it
      if (selectedWidget && selectedWidget.type === 'card') {
        addWidget(widgetType, undefined, selectedWidgetId);
        message.success(`Added ${widgetType} widget to ${selectedWidget.widget.title || 'Card'} container`);
        return;
      }
    }
    
    // Otherwise add to the main layout
    addWidget(widgetType);
    message.success(`Added ${widgetType} widget to bottom of layout`);
  };

  const handleRemoveWidget = () => {
    if (selectedWidgetId) {
      removeWidget(selectedWidgetId);
    }
  };

  const handlePropertyChange = (propertyName: string, value: any) => {
    if (selectedWidgetId) {
      updateWidgetProperty(selectedWidgetId, propertyName, value);
    }
  };

  const handleExport = () => {
    const data = exportDashboard();
    setExportData(data);
    setExportModalVisible(true);
  };

  const handlePreview = () => {
    // Save the current layout to localStorage for the preview page to access
    localStorage.setItem('dashboardPreviewData', exportDashboard());
    // Open preview in a new tab
    window.open('/preview', '_blank');
  };

  const handleImport = () => {
    try {
      importDashboard(importData);
      setImportModalVisible(false);
      message.success('Dashboard imported successfully');
    } catch (error) {
      message.error('Failed to import dashboard');
    }
  };

  const renderPropertyEditor = () => {
    if (!selectedWidgetId) {
      return <div style={{ padding: 16 }}>Select a widget to edit its properties</div>;
    }

    const selectedWidgetInfo = findWidgetInLayout(dashboardState.layout.layouts, selectedWidgetId);
    const selectedWidget = selectedWidgetInfo?.widget;
    
    if (!selectedWidget) {
      return <div style={{ padding: 16 }}>Widget not found</div>;
    }

    const widgetDefinition = getWidgetDefinition(selectedWidget.type);
    const PropertyEditor = widgetDefinition.propertyEditor;

    if (!PropertyEditor) {
      return <div style={{ padding: 16 }}>No property editor available for this widget type</div>;
    }

    return (
      <div style={{ padding: 16 }}>
        <h3>{selectedWidget.title} Properties</h3>
        <PropertyEditor widget={selectedWidget} onPropertyChange={handlePropertyChange} />
      </div>
    );
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <h1 style={{ color: 'white', margin: 0, marginRight: 'auto' }}>Dashboard Designer</h1>
        
        {dashboardState.editMode && selectedWidgetId && (
          <>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ marginRight: 8 }}
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveWidget}
              style={{ marginRight: 16 }}
            />
          </>
        )}
        
        <Button
          type={dashboardState.editMode ? 'primary' : 'default'}
          icon={<EditOutlined />}
          onClick={toggleEditMode}
          style={{ marginRight: 8 }}
          title={dashboardState.editMode ? 'Exit Edit Mode' : 'Edit Mode'}
        />
        <Button
          icon={<ImportOutlined />}
          onClick={() => setImportModalVisible(true)}
          style={{ marginRight: 8 }}
          title="Import"
        />
        <Button
          icon={<ExportOutlined />}
          onClick={handleExport}
          style={{ marginRight: 8 }}
          title="Export"
        />
        <Button
          icon={<EyeOutlined />}
          onClick={handlePreview}
          style={{ marginRight: 8 }}
          title="Preview"
        />
      </Header>
      <Layout>
        {dashboardState.editMode && (
          <Sider width={200} theme="light">
            <div style={{ padding: '16px 8px' }}>
              <h3>Widgets</h3>
              <Menu 
                mode="vertical"
                items={Object.values(widgetRegistry).map((widget) => ({
                  key: widget.type,
                  icon: widget.icon,
                  label: widget.name,
                  onClick: () => handleAddWidget(widget.type)
                }))}
              />
            </div>
          </Sider>
        )}
        <Content style={{ height: '100%', position: 'relative' }}>
          <DashboardGrid
            layout={dashboardState.layout}
            isEditing={dashboardState.editMode}
          />
        </Content>
      </Layout>

      <Drawer
        title="Widget Properties"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {renderPropertyEditor()}
      </Drawer>

      <Modal
        title="Import Dashboard"
        open={importModalVisible}
        onOk={handleImport}
        onCancel={() => setImportModalVisible(false)}
      >
        <p>Paste your dashboard JSON below:</p>
        <TextArea
          rows={10}
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
        />
      </Modal>

      <Modal
        title="Export Dashboard"
        open={exportModalVisible}
        onOk={() => setExportModalVisible(false)}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExportModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <p>Copy your dashboard JSON:</p>
        <TextArea rows={10} value={exportData} readOnly />
      </Modal>
    </Layout>
  );
};

export default DashboardDesigner;

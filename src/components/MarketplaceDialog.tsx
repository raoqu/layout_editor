import React, { useState, useContext, useEffect } from 'react';
import { Modal, Tabs, Form, Input, Button, message, Divider, Typography, Space, Table, Tooltip, Popconfirm } from 'antd';
import { CloudOutlined, CloudUploadOutlined, AppstoreOutlined, CodeOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import WidgetMarketplace from '../marketplace/WidgetMarketplace';
import WidgetPluginSystem from '../marketplace/WidgetPluginSystem';
import { DashboardContext } from '../contexts/DashboardContext';

const { Text } = Typography;

interface MarketplaceDialogProps {
  open: boolean;
  onClose: () => void;
  onWidgetInstalled?: () => void;
}

/**
 * MarketplaceDialog component
 * 
 * Displays a modal dialog with the widget marketplace, allowing users to browse,
 * search, and install widgets from the marketplace.
 */
const MarketplaceDialog: React.FC<MarketplaceDialogProps> = ({ open, onClose, onWidgetInstalled }) => {
  const { refreshWidgets } = useContext(DashboardContext);

  const [remoteUrl, setRemoteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearingWidgets, setClearingWidgets] = useState(false);
  const [remoteUrls, setRemoteUrls] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  
  // Load remote widget URLs when the dialog opens
  useEffect(() => {
    if (open) {
      loadRemoteWidgetUrls();
    }
  }, [open]);
  
  // Load remote widget URLs from the WidgetPluginSystem
  const loadRemoteWidgetUrls = () => {
    const urls = WidgetPluginSystem.getRemoteWidgetUrls();
    setRemoteUrls(urls);
    console.log('Loaded remote widget URLs:', urls);
  };

  // Handle refreshing a specific remote widget
  const handleRefreshWidget = async (widgetType: string) => {
    setRefreshing(prev => ({ ...prev, [widgetType]: true }));
    try {
      const success = await WidgetPluginSystem.refreshRemoteWidget(widgetType);
      if (success) {
        message.success(`Widget ${widgetType} refreshed successfully`);
        if (refreshWidgets) refreshWidgets();
        if (onWidgetInstalled) onWidgetInstalled();
      } else {
        message.error(`Failed to refresh widget ${widgetType}`);
      }
    } catch (error) {
      console.error(`Error refreshing widget:`, error);
      message.error(`Error refreshing widget: ${error}`);
    } finally {
      setRefreshing(prev => ({ ...prev, [widgetType]: false }));
    }
  };

  // Handle refreshing all remote widgets
  const handleRefreshAll = async () => {
    setLoading(true);
    try {
      const results = await WidgetPluginSystem.refreshAllRemoteWidgets();
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      if (successCount === totalCount) {
        message.success(`All ${totalCount} widgets refreshed successfully`);
      } else {
        message.warning(`${successCount} of ${totalCount} widgets refreshed successfully`);
      }
      
      if (refreshWidgets) refreshWidgets();
      if (onWidgetInstalled) onWidgetInstalled();
    } catch (error) {
      console.error(`Error refreshing widgets:`, error);
      message.error(`Error refreshing widgets: ${error}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle clearing all remote widgets
  const handleClearAllWidgets = async () => {
    setClearingWidgets(true);
    try {
      const success = WidgetPluginSystem.clearAllRemoteWidgets();
      if (success) {
        message.success('All remote widgets cleared successfully');
        // Update the local state
        setRemoteUrls({});
        // Refresh the dashboard widgets
        if (refreshWidgets) refreshWidgets();
        if (onWidgetInstalled) onWidgetInstalled();
      } else {
        message.error('Failed to clear remote widgets');
      }
    } catch (error) {
      console.error(`Error clearing remote widgets:`, error);
      message.error(`Error clearing remote widgets: ${error}`);
    } finally {
      setClearingWidgets(false);
    }
  };

  const handleRegisterRemoteWidget = async () => {
    if (!remoteUrl) {
      message.error('Please enter a remote widget URL');
      return;
    }

    setLoading(true);
    try {
      const success = await WidgetPluginSystem.registerRemoteWidget(remoteUrl);
      if (success) {
        message.success('Remote widget registered successfully!');
        setRemoteUrl('');
        loadRemoteWidgetUrls(); // Reload the remote widget URLs
        if (refreshWidgets) refreshWidgets();
        if (onWidgetInstalled) onWidgetInstalled();
      } else {
        message.error('Failed to register remote widget');
      }
    } catch (error) {
      console.error('Error registering remote widget:', error);
      message.error('Error registering remote widget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Widget Marketplace"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Tabs
        defaultActiveKey="browse"
        items={[
          {
            key: 'browse',
            label: (
              <span>
                <AppstoreOutlined /> Browse Widgets
              </span>
            ),
            children: <WidgetMarketplace onWidgetInstalled={() => {
              message.success('Widget installed successfully!');
              if (refreshWidgets) refreshWidgets();
              if (onWidgetInstalled) onWidgetInstalled();
            }} />
          },
          {
            key: 'remote',
            label: (
              <span>
                <CloudOutlined /> Remote Widgets
              </span>
            ),
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <Typography.Title level={5}>Register Remote Widget</Typography.Title>
                    <Text type="secondary">
                      Register a remote widget by providing the URL to the widget server.
                      The server must expose a manifest.json file and the widget components.
                    </Text>
                  </div>
                  <Space>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleRefreshAll}
                      loading={loading}
                    >
                      Refresh All
                    </Button>
                    <Popconfirm
                      title="Clear all remote widgets"
                      description="Are you sure you want to clear all registered remote widgets? This cannot be undone."
                      onConfirm={handleClearAllWidgets}
                      okText="Yes, Clear All"
                      cancelText="No"
                      okButtonProps={{ danger: true, loading: clearingWidgets }}
                    >
                      <Button 
                        danger
                        icon={<DeleteOutlined />}
                        disabled={Object.keys(remoteUrls).length === 0}
                      >
                        Clear All
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
                
                <Form layout="inline" style={{ marginTop: 16, marginBottom: 24 }}>
                  <Form.Item style={{ flex: 1 }}>
                    <Input 
                      placeholder="Enter remote widget URL (e.g., http://localhost:5173)" 
                      value={remoteUrl}
                      onChange={(e) => setRemoteUrl(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button 
                      type="primary" 
                      icon={<CloudUploadOutlined />} 
                      onClick={handleRegisterRemoteWidget}
                      loading={loading}
                    >
                      Register
                    </Button>
                  </Form.Item>
                </Form>
                
                <Divider orientation="left">Registered Remote Widgets</Divider>
                
                {/* Table of registered remote widget URLs */}
                <Table 
                  dataSource={Object.entries(remoteUrls).map(([type, url]) => ({
                    key: type,
                    type,
                    url
                  }))}
                  columns={[
                    {
                      title: 'Widget Type',
                      dataIndex: 'type',
                      key: 'type',
                    },
                    {
                      title: 'Remote URL',
                      dataIndex: 'url',
                      key: 'url',
                      ellipsis: true,
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_: any, record: { type: string, url: string }) => (
                        <Space>
                          <Tooltip title="Refresh widget from source">
                            <Button
                              icon={<ReloadOutlined />}
                              onClick={() => handleRefreshWidget(record.type)}
                              loading={refreshing[record.type]}
                              size="small"
                            >
                              Refresh
                            </Button>
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                  pagination={false}
                  locale={{ emptyText: 'No remote widget sources registered' }}
                  size="small"
                />
                
                <Divider orientation="left">How It Works</Divider>
                
                <Space direction="vertical">
                  <Text>1. Build your remote widget with the required structure</Text>
                  <Text>2. Host it on a web server accessible to the dashboard</Text>
                  <Text>3. Register it using the URL to the server</Text>
                  <Text>4. The widget will be available in the dashboard</Text>
                  <Text>5. Use the refresh button to update widgets when new versions are available</Text>
                </Space>
              </div>
            )
          },
          {
            key: 'installed',
            label: (
              <span>
                <CloudUploadOutlined /> Installed Widgets
              </span>
            ),
            children: (
              <div className="installed-widgets">
                <h3>Installed External Widgets</h3>
                <p>
                  This tab shows all external widgets that you have installed from the marketplace.
                  You can manage them here or uninstall them if needed.
                </p>
                {/* We'll implement this in a future update */}
                <div className="coming-soon">
                  <AppstoreOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <p>Widget management coming soon!</p>
                </div>
              </div>
            )
          },
          {
            key: 'developer',
            label: (
              <span>
                <CodeOutlined /> Developer Resources
              </span>
            ),
            children: (
              <div className="widget-development">
                <h3>Widget Development</h3>
                <p>
                  Want to create your own custom widgets? This section provides resources
                  and documentation to help you get started with widget development.
                </p>
                <h4>Getting Started</h4>
                <ol>
                  <li>Use the Example Widget Template as a starting point</li>
                  <li>Implement your widget component and property editor</li>
                  <li>Test your widget locally</li>
                  <li>Package and publish your widget</li>
                </ol>
                <p>
                  Check out our documentation for more detailed instructions on creating
                  custom widgets for the Dash Designer marketplace.
                </p>
                {/* We'll implement this in a future update */}
                <div className="coming-soon">
                  <AppstoreOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                  <p>Developer tools coming soon!</p>
                </div>
              </div>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default MarketplaceDialog;

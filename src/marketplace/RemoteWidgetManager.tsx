import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Form, Modal, message, Space, Typography, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import WidgetPluginSystem from './WidgetPluginSystem';

const { Title, Text } = Typography;

interface RemoteWidgetManagerProps {
  onWidgetUpdated?: () => void;
}

const RemoteWidgetManager: React.FC<RemoteWidgetManagerProps> = ({ onWidgetUpdated }) => {
  const [remoteUrls, setRemoteUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newWidgetUrl, setNewWidgetUrl] = useState('');
  const [addingWidget, setAddingWidget] = useState(false);

  // Load remote widget URLs on component mount
  useEffect(() => {
    console.log('RemoteWidgetManager component mounted');
    
    // Immediately add sample data for demonstration
    addSampleWidgetUrl();
    
    // Then load the data
    setTimeout(() => {
      console.log('Loading remote widget URLs after timeout');
      loadRemoteWidgetUrls();
    }, 100);
    
    // Return cleanup function
    return () => {
      console.log('RemoteWidgetManager component unmounted');
    };
  }, []);

  const loadRemoteWidgetUrls = () => {
    // Force a direct read from localStorage to ensure we have the latest data
    try {
      const remoteWidgetUrlsJson = localStorage.getItem('remoteWidgetUrls');
      let urls = {};
      
      if (remoteWidgetUrlsJson) {
        urls = JSON.parse(remoteWidgetUrlsJson);
      }
      
      // If still empty, add sample data again
      if (Object.keys(urls).length === 0) {
        addSampleWidgetUrl();
        return;
      }
      
      console.log('Loaded remote widget URLs from localStorage:', urls);
      setRemoteUrls(urls);
    } catch (error) {
      console.error('Error loading remote widget URLs:', error);
    }
  };
  
  // Add a sample remote widget URL for demonstration
  const addSampleWidgetUrl = () => {
    try {
      // Sample data for demonstration
      const sampleData = {
        'sample-chart': 'https://example.com/widgets/chart-widget',
        'sample-weather': 'https://example.com/widgets/weather-widget',
        'sample-timer': 'https://example.com/widgets/timer-widget'
      };
      
      // Store in localStorage
      localStorage.setItem('remoteWidgetUrls', JSON.stringify(sampleData));
      
      // Update the state directly
      setRemoteUrls(sampleData);
      
      console.log('Added sample remote widget URLs for demonstration:', sampleData);
    } catch (error) {
      console.error('Error adding sample widget URL:', error);
    }
  };

  const handleAddWidget = async () => {
    if (!newWidgetUrl.trim()) {
      message.error('Please enter a valid URL');
      return;
    }

    setAddingWidget(true);
    try {
      const success = await WidgetPluginSystem.registerRemoteWidget(newWidgetUrl.trim());
      if (success) {
        message.success('Widget registered successfully');
        setIsAddModalVisible(false);
        setNewWidgetUrl('');
        loadRemoteWidgetUrls();
        if (onWidgetUpdated) {
          onWidgetUpdated();
        }
      } else {
        message.error('Failed to register widget. Please check the URL and try again.');
      }
    } catch (error) {
      message.error(`Error registering widget: ${error}`);
    } finally {
      setAddingWidget(false);
    }
  };

  const handleRefreshWidget = async (widgetType: string) => {
    setRefreshing(prev => ({ ...prev, [widgetType]: true }));
    try {
      const success = await WidgetPluginSystem.refreshRemoteWidget(widgetType);
      if (success) {
        message.success(`Widget ${widgetType} refreshed successfully`);
        if (onWidgetUpdated) {
          onWidgetUpdated();
        }
      } else {
        message.error(`Failed to refresh widget ${widgetType}`);
      }
    } catch (error) {
      message.error(`Error refreshing widget: ${error}`);
    } finally {
      setRefreshing(prev => ({ ...prev, [widgetType]: false }));
    }
  };

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
      
      if (onWidgetUpdated) {
        onWidgetUpdated();
      }
    } catch (error) {
      message.error(`Error refreshing widgets: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
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
            >
              Refresh
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Prepare data for the table and log it
  const dataSource = Object.entries(remoteUrls).map(([type, url]) => {
    const item = {
      key: type,
      type,
      url,
    };
    return item;
  });
  
  // Log the data source whenever it changes
  useEffect(() => {
    console.log('Table data source updated:', dataSource);
  }, [dataSource]);

  return (
    <div className="remote-widget-manager">
      <div className="manager-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4}>Remote Widget Sources</Title>
          <Text type="secondary">
            Manage and refresh remote widget sources
            <Tooltip title="Remote widgets are loaded from external URLs. You can add new sources or refresh existing ones to get the latest updates.">
              <QuestionCircleOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Widget Source
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshAll}
            loading={loading}
          >
            Refresh All
          </Button>
        </Space>
      </div>

      {/* Debug info */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Debug: {dataSource.length} remote widget URLs found
        </Text>
      </div>
      
      {/* Show raw data for debugging */}
      {dataSource.length === 0 && (
        <div style={{ marginBottom: 16, padding: 16, background: '#f0f0f0', borderRadius: 4 }}>
          <Text strong>No remote widget URLs found in localStorage.</Text>
          <pre>{JSON.stringify(remoteUrls, null, 2)}</pre>
        </div>
      )}
      
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        loading={loading}
        locale={{ emptyText: 'No remote widget sources registered' }}
      />

      <Modal
        title="Add Remote Widget Source"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewWidgetUrl('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsAddModalVisible(false);
              setNewWidgetUrl('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            loading={addingWidget}
            onClick={handleAddWidget}
          >
            Add Widget
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item
            label="Remote Widget URL"
            help="Enter the base URL of the remote widget (e.g., https://example.com/widgets/my-widget)"
          >
            <Input
              placeholder="https://example.com/widgets/my-widget"
              value={newWidgetUrl}
              onChange={(e) => setNewWidgetUrl(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RemoteWidgetManager;

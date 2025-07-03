import React, { useState, useEffect } from 'react';
import { Card, List, Input, Select, Tag, Button, Spin, Modal, Rate, Typography, Space, Divider } from 'antd';
import { SearchOutlined, DownloadOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { MockMarketplaceService } from './MarketplaceService';
import type { MarketplaceWidgetMetadata, WidgetFilters } from './types';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

interface WidgetMarketplaceProps {
  onWidgetInstalled?: () => void;
}

const WidgetMarketplace: React.FC<WidgetMarketplaceProps> = ({ onWidgetInstalled }) => {
  const [widgets, setWidgets] = useState<MarketplaceWidgetMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<WidgetFilters>({
    query: '',
    tags: [],
    sortBy: 'popular'
  });
  const [selectedWidget, setSelectedWidget] = useState<MarketplaceWidgetMetadata | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  const marketplaceService = new MockMarketplaceService();

  useEffect(() => {
    fetchWidgets();
  }, [page, filters]);

  const fetchWidgets = async () => {
    setLoading(true);
    try {
      const response = await marketplaceService.fetchWidgets(page, pageSize, filters);
      setWidgets(response.widgets);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters({ ...filters, query: value });
    setPage(1);
  };

  const handleSortChange = (value: 'popular' | 'recent' | 'rating') => {
    setFilters({ ...filters, sortBy: value });
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setFilters({ ...filters, tags: newTags });
    setPage(1);
  };

  const showWidgetDetails = (widget: MarketplaceWidgetMetadata) => {
    setSelectedWidget(widget);
    setDetailsVisible(true);
  };

  const handleInstall = async () => {
    if (!selectedWidget) return;
    
    setInstalling(true);
    try {
      const success = await marketplaceService.installWidget(selectedWidget.id);
      if (success) {
        Modal.success({
          title: 'Widget Installed',
          content: `${selectedWidget.name} has been successfully installed and is now available in your widget list.`
        });
        
        // Notify parent component that a widget was installed
        if (onWidgetInstalled) {
          onWidgetInstalled();
        }
        setDetailsVisible(false);
      } else {
        Modal.error({
          title: 'Installation Failed',
          content: 'Failed to install the widget. Please try again later.'
        });
      }
    } catch (error) {
      Modal.error({
        title: 'Installation Error',
        content: `Error: ${error}`
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="widget-marketplace">
      <div className="marketplace-header">
        <Title level={2}>Widget Marketplace</Title>
        <Paragraph>
          Discover and install custom widgets to enhance your dashboards
        </Paragraph>
        
        <div className="marketplace-filters">
          <Space wrap>
            <Input.Search
              placeholder="Search widgets..."
              onSearch={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            
            <Select
              defaultValue="popular"
              style={{ width: 150 }}
              onChange={handleSortChange}
              prefix={<SortAscendingOutlined />}
            >
              <Option value="popular">Most Popular</Option>
              <Option value="recent">Recently Updated</Option>
              <Option value="rating">Highest Rated</Option>
            </Select>
            
            <div className="filter-label">
              <FilterOutlined /> Filter by tags:
            </div>
            
            <div className="tag-filters">
              {['weather', 'timer', 'chart', 'finance', 'data'].map(tag => (
                <Tag
                  key={tag}
                  color={filters.tags?.includes(tag) ? 'blue' : 'default'}
                  onClick={() => handleTagClick(tag)}
                  style={{ cursor: 'pointer' }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Space>
        </div>
      </div>
      
      <Divider />
      
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
          dataSource={widgets}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (newPage) => setPage(newPage),
          }}
          renderItem={(widget) => (
            <List.Item>
              <Card
                hoverable
                cover={widget.thumbnailUrl ? <img alt={widget.name} src={widget.thumbnailUrl} /> : null}
                actions={[
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={() => showWidgetDetails(widget)}
                  >
                    Details
                  </Button>
                ]}
              >
                <Card.Meta
                  title={widget.name}
                  description={
                    <>
                      <Paragraph ellipsis={{ rows: 2 }}>{widget.description}</Paragraph>
                      <div className="widget-meta">
                        <Rate disabled defaultValue={widget.rating} allowHalf style={{ fontSize: '14px' }} />
                        <Text type="secondary">{widget.downloadCount} downloads</Text>
                      </div>
                      <div className="widget-tags">
                        {widget.tags.map(tag => (
                          <Tag key={tag} onClick={() => handleTagClick(tag)} style={{ cursor: 'pointer' }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
      
      <Modal
        title={selectedWidget?.name}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDetailsVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="install" 
            type="primary" 
            icon={<DownloadOutlined />}
            loading={installing}
            onClick={handleInstall}
          >
            Install Widget
          </Button>
        ]}
        width={700}
      >
        {selectedWidget && (
          <div className="widget-details">
            <div className="widget-details-header">
              {selectedWidget.thumbnailUrl && (
                <img 
                  src={selectedWidget.thumbnailUrl} 
                  alt={selectedWidget.name} 
                  className="widget-thumbnail" 
                />
              )}
              <div className="widget-info">
                <Rate disabled defaultValue={selectedWidget.rating} allowHalf />
                <Text type="secondary">{selectedWidget.downloadCount} downloads</Text>
                <Text>Version: {selectedWidget.version}</Text>
                <Text>Author: {selectedWidget.author}</Text>
                <Text>Updated: {new Date(selectedWidget.updatedAt).toLocaleDateString()}</Text>
              </div>
            </div>
            
            <Divider />
            
            <Title level={4}>Description</Title>
            <Paragraph>{selectedWidget.description}</Paragraph>
            
            <Title level={4}>Tags</Title>
            <div className="widget-tags">
              {selectedWidget.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WidgetMarketplace;

import React, { useState, useContext } from 'react';
import { Modal, Tabs, Button } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import WidgetMarketplace from '../marketplace/WidgetMarketplace';
import { DashboardContext } from '../contexts/DashboardContext';
// Import will be used in future implementation
// import widgetPluginSystem from '../marketplace/WidgetPluginSystem';

const { TabPane } = Tabs;

interface MarketplaceDialogProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * MarketplaceDialog component
 * 
 * Displays a modal dialog with the widget marketplace, allowing users to browse,
 * search, and install widgets from the marketplace.
 */
const MarketplaceDialog: React.FC<MarketplaceDialogProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const { refreshWidgets } = useContext(DashboardContext);
  
  // When a widget is installed, refresh the widget registry
  const handleWidgetInstalled = () => {
    // Refresh available widgets in the dashboard
    if (refreshWidgets) {
      refreshWidgets();
    }
  };
  
  return (
    <Modal
      title="Widget Marketplace"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Browse Widgets" key="browse">
          <WidgetMarketplace onWidgetInstalled={handleWidgetInstalled} />
        </TabPane>
        <TabPane tab="Installed Widgets" key="installed">
          <div className="installed-widgets">
            <h3>Installed External Widgets</h3>
            <p>
              This tab shows all external widgets that you have installed from the marketplace.
              You can manage them here or uninstall them if needed.
            </p>
            {/* We'll implement this in a future update */}
            <div className="coming-soon">
              <AppstoreAddOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <p>Widget management coming soon!</p>
            </div>
          </div>
        </TabPane>
        <TabPane tab="Develop" key="develop">
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
              <AppstoreAddOutlined style={{ fontSize: '48px', color: '#ccc' }} />
              <p>Developer tools coming soon!</p>
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default MarketplaceDialog;

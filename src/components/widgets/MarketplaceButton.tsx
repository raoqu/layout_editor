import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import MarketplaceDialog from '../MarketplaceDialog';
import '../../styles/widget-actions.css';

/**
 * MarketplaceButton component
 * 
 * Displays a button that opens the widget marketplace dialog
 */
const MarketplaceButton: React.FC = () => {
  const [marketplaceVisible, setMarketplaceVisible] = useState(false);
  
  const openMarketplace = () => {
    setMarketplaceVisible(true);
  };
  
  const closeMarketplace = () => {
    setMarketplaceVisible(false);
  };

  return (
    <>
      <Tooltip title="Browse Widget Marketplace">
        <Button 
          type="primary"
          icon={<AppstoreAddOutlined />}
          onClick={openMarketplace}
          className="marketplace-button"
        >
          Marketplace
        </Button>
      </Tooltip>
      
      <MarketplaceDialog 
        visible={marketplaceVisible} 
        onClose={closeMarketplace} 
      />
    </>
  );
};

export default MarketplaceButton;

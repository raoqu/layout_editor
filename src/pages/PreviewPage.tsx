import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import DashboardPreview from '../components/DashboardPreview';
import type { DashboardLayout } from '../types';

const { Content } = Layout;

const PreviewPage: React.FC = () => {
  const [layout, setLayout] = useState<DashboardLayout | null>(null);

  useEffect(() => {
    // Get layout data from localStorage
    const layoutData = localStorage.getItem('dashboardPreviewData');
    if (layoutData) {
      try {
        const parsedLayout = JSON.parse(layoutData);
        setLayout(parsedLayout);
      } catch (error) {
        console.error('Failed to parse dashboard preview data:', error);
      }
    }
  }, []);

  if (!layout) {
    return (
      <Layout style={{ height: '100vh' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <h2>No preview data available</h2>
          <p>Please generate a preview from the Dashboard Designer</p>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ height: '100%', position: 'relative' }}>
        <DashboardPreview layout={layout} />
      </Content>
    </Layout>
  );
};

export default PreviewPage;

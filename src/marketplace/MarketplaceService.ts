import React from 'react';
import type { ReactNode } from 'react';
import type { MarketplaceResponse, MarketplaceWidget, MarketplaceService, WidgetFilters } from './types';
import type { WidgetDefinition } from '../types';
import { CloudOutlined, ClockCircleOutlined, StockOutlined, BulbOutlined, BarChartOutlined } from '@ant-design/icons';
import WidgetPluginSystem from './WidgetPluginSystem';

/**
 * Mock implementation of the MarketplaceService for development
 */
export class MockMarketplaceService implements MarketplaceService {
  private mockWidgets: MarketplaceWidget[] = [];
  
  constructor() {
    // Initialize with mock marketplace widgets
    this.initializeMockWidgets();
  }
  
  private initializeMockWidgets(): void {
    this.mockWidgets = [
      {
        id: 'weather-widget',
        name: 'Weather Widget',
        description: 'Displays current weather information for a specified location',
        version: '1.0.0',
        author: 'Dash Designer Team',
        thumbnailUrl: 'https://via.placeholder.com/150?text=Weather+Widget',
        tags: ['weather', 'forecast', 'temperature'],
        createdAt: '2025-06-15T10:00:00Z',
        updatedAt: '2025-06-30T14:30:00Z',
        downloadCount: 1250,
        rating: 4.7,
        widgetDefinition: this.createWeatherWidgetDefinition(),
      },
      {
        id: 'countdown-timer',
        name: 'Countdown Timer',
        description: 'A customizable countdown timer for tracking deadlines and events',
        version: '1.1.2',
        author: 'TimerWorks',
        thumbnailUrl: 'https://via.placeholder.com/150?text=Countdown+Timer',
        tags: ['timer', 'countdown', 'clock'],
        createdAt: '2025-05-20T08:15:00Z',
        updatedAt: '2025-07-01T09:45:00Z',
        downloadCount: 875,
        rating: 4.5,
        widgetDefinition: this.createCountdownWidgetDefinition(),
      },
      {
        id: 'stock-ticker',
        name: 'Stock Ticker',
        description: 'Real-time stock price tracker with customizable watchlists',
        version: '2.0.1',
        author: 'FinanceApps',
        thumbnailUrl: 'https://via.placeholder.com/150?text=Stock+Ticker',
        tags: ['finance', 'stocks', 'market'],
        createdAt: '2025-04-10T11:30:00Z',
        updatedAt: '2025-06-25T16:20:00Z',
        downloadCount: 2100,
        rating: 4.8,
        widgetDefinition: this.createStockTickerWidgetDefinition(),
      },
      {
        id: 'example-widget-template',
        name: 'Example Widget Template',
        description: 'A template for creating custom widgets for the Dash Designer marketplace',
        version: '1.0.0',
        author: 'Dash Designer Team',
        thumbnailUrl: 'https://via.placeholder.com/150?text=Widget+Template',
        tags: ['template', 'example', 'custom'],
        createdAt: '2025-07-01T09:00:00Z',
        updatedAt: '2025-07-01T09:00:00Z',
        downloadCount: 350,
        rating: 4.9,
        widgetDefinition: this.createExampleWidgetDefinition(),
      },
      {
        id: 'data-visualizer',
        name: 'Data Visualizer',
        description: 'Advanced data visualization widget with multiple chart types and customization options',
        version: '1.2.0',
        author: 'DataViz Inc.',
        thumbnailUrl: 'https://via.placeholder.com/150?text=Data+Visualizer',
        tags: ['chart', 'data', 'visualization'],
        createdAt: '2025-05-05T14:20:00Z',
        updatedAt: '2025-06-28T11:15:00Z',
        downloadCount: 1850,
        rating: 4.6,
        widgetDefinition: this.createDataVisualizerDefinition(),
      }
    ];
  }
  
  private createWeatherWidgetDefinition(): WidgetDefinition {
    // Import dynamically to avoid circular dependencies
    const WeatherWidget = React.lazy(() => import('./widgets/WeatherWidget'));
    const WeatherPropertyEditor = React.lazy(() => import('./widgets/WeatherPropertyEditor'));
    
    return {
      type: 'weather',
      name: 'Weather',
      icon: React.createElement(CloudOutlined) as ReactNode,
      defaultSize: [4, 3],
      defaultProperties: {
        location: 'New York',
        unit: 'celsius',
        showForecast: true,
        title: 'Weather Forecast',
      },
      component: WeatherWidget,
      propertyEditor: WeatherPropertyEditor,
    };
  }
  
  private createCountdownWidgetDefinition(): WidgetDefinition {
    // For now we'll use a placeholder component until the real one is implemented
    const PlaceholderComponent = () => React.createElement('div', null, 'Countdown Timer Widget');
    
    return {
      type: 'countdown',
      name: 'Countdown',
      icon: React.createElement(ClockCircleOutlined) as ReactNode,
      defaultSize: [4, 2],
      defaultProperties: {
        targetDate: '2025-12-31T00:00:00Z',
        title: 'New Year Countdown',
        showSeconds: true,
        format: 'verbose',
      },
      component: PlaceholderComponent,
      propertyEditor: undefined, // Will be implemented later
    };
  }
  
  private createStockTickerWidgetDefinition(): WidgetDefinition {
    // For now we'll use a placeholder component until the real one is implemented
    const PlaceholderComponent = () => React.createElement('div', null, 'Stock Ticker Widget');
    
    return {
      type: 'stock-ticker',
      name: 'Stock Ticker',
      icon: React.createElement(StockOutlined) as ReactNode,
      defaultSize: [6, 3],
      defaultProperties: {
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN'],
        refreshInterval: 60,
        showChart: true,
        title: 'Stock Tracker',
      },
      component: PlaceholderComponent,
      propertyEditor: undefined, // Will be implemented later
    };
  }
  
  async fetchWidgets(page: number = 1, pageSize: number = 10, filters?: WidgetFilters): Promise<MarketplaceResponse> {
    // Apply filters if provided
    let filteredWidgets = [...this.mockWidgets];
    
    if (filters) {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredWidgets = filteredWidgets.filter(widget => 
          widget.name.toLowerCase().includes(query) || 
          widget.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filteredWidgets = filteredWidgets.filter(widget => 
          filters.tags!.some(tag => widget.tags.includes(tag))
        );
      }
      
      if (filters.author) {
        filteredWidgets = filteredWidgets.filter(widget => 
          widget.author.toLowerCase() === filters.author!.toLowerCase()
        );
      }
      
      // Sort results
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'popular':
            filteredWidgets.sort((a, b) => b.downloadCount - a.downloadCount);
            break;
          case 'recent':
            filteredWidgets.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            break;
          case 'rating':
            filteredWidgets.sort((a, b) => b.rating - a.rating);
            break;
        }
      }
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedWidgets = filteredWidgets.slice(startIndex, endIndex);
    
    // Return response
    return {
      widgets: paginatedWidgets.map(({ widgetDefinition, source, ...metadata }) => metadata),
      totalCount: filteredWidgets.length,
      page,
      pageSize
    };
  }
  
  async getWidgetDetails(id: string): Promise<MarketplaceWidget> {
    const widget = this.mockWidgets.find(w => w.id === id);
    if (!widget) {
      throw new Error(`Widget with ID ${id} not found`);
    }
    return widget;
  }
  
  async installWidget(id: string): Promise<boolean> {
    try {
      const widget = await this.getWidgetDetails(id);
      
      // In a real implementation, this would download and install the widget
      console.log(`Installing widget: ${widget.name}`);
      
      // Use the plugin system to register and install the widget
      const pluginSystem = WidgetPluginSystem;
      const registered = pluginSystem.registerWidget(widget.widgetDefinition);
      
      if (registered) {
        const installed = pluginSystem.installWidget(widget.widgetDefinition.type);
        
        if (installed) {
          // Mark as installed in our mock data
          const index = this.mockWidgets.findIndex(w => w.id === id);
          if (index !== -1) {
            this.mockWidgets[index].isInstalled = true;
          }
          return true;
        }
      }
      
      console.error(`Failed to install widget: Invalid widget definition`);
      return false;
    } catch (error) {
      console.error(`Failed to install widget: ${error}`);
      return false;
    }
  }
  
  private createExampleWidgetDefinition(): WidgetDefinition {
    // Import dynamically to avoid circular dependencies
    const ExampleWidgetTemplate = React.lazy(() => import('./widgets/ExampleWidgetTemplate'));
    const ExamplePropertyEditor = React.lazy(() => import('./widgets/ExamplePropertyEditor'));
    
    return {
      type: 'example-template',
      name: 'Example Template',
      icon: React.createElement(BulbOutlined) as ReactNode,
      defaultSize: [4, 3],
      defaultProperties: {
        title: 'Example Widget',
        backgroundColor: '#ffffff',
        showCounter: true,
        counterStart: 0,
      },
      component: ExampleWidgetTemplate,
      propertyEditor: ExamplePropertyEditor,
    };
  }
  
  private createDataVisualizerDefinition(): WidgetDefinition {
    // For now we'll use a placeholder component until the real one is implemented
    const PlaceholderComponent = () => React.createElement('div', null, 'Data Visualizer Widget');
    
    return {
      type: 'data-visualizer',
      name: 'Data Visualizer',
      icon: React.createElement(BarChartOutlined) as ReactNode,
      defaultSize: [6, 4],
      defaultProperties: {
        title: 'Data Visualizer',
        chartType: 'bar',
        dataSource: 'sample',
        showLegend: true,
        colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
      },
      component: PlaceholderComponent,
      propertyEditor: undefined, // Will be implemented later
    };
  }
}

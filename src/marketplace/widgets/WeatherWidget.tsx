import React, { useState, useEffect } from 'react';
import { Card, Spin, Typography, Row, Col, Statistic } from 'antd';
import { CloudOutlined, CompassOutlined } from '@ant-design/icons';
import type { WidgetComponentProps } from '../../types';

const { Title, Text } = Typography;

/**
 * Example Weather Widget for the marketplace
 * This demonstrates how to create a custom widget that can be added to the dashboard
 */
const WeatherWidget: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const { location, unit, showForecast, title } = widget.properties;
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [error] = useState<string | null>(null);

  // Mock weather data - in a real widget this would fetch from an API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Mock data based on location
      const mockData = {
        location: location || 'New York',
        temperature: unit === 'fahrenheit' ? 72 : 22,
        unit: unit === 'fahrenheit' ? '°F' : '°C',
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        windDirection: 'NE',
        forecast: [
          { day: 'Today', high: unit === 'fahrenheit' ? 75 : 24, low: unit === 'fahrenheit' ? 65 : 18, condition: 'Partly Cloudy' },
          { day: 'Tomorrow', high: unit === 'fahrenheit' ? 78 : 26, low: unit === 'fahrenheit' ? 68 : 20, condition: 'Sunny' },
          { day: 'Wed', high: unit === 'fahrenheit' ? 71 : 22, low: unit === 'fahrenheit' ? 62 : 17, condition: 'Rain' },
        ]
      };
      
      setWeather(mockData);
      setLoading(false);
    }, 1000);
  }, [location, unit]);

  return (
    <Card
      title={title || null}
      headStyle={{ display: title ? 'block' : 'none' }}
      style={{ 
        height: '100%', 
        width: '100%',
        border: isSelected ? '2px dashed #1890ff' : '1px solid #f0f0f0',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: '12px', height: title ? 'calc(100% - 57px)' : '100%' }}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: 'red' }}>
          <Text type="danger">{error}</Text>
        </div>
      ) : (
        <div className="weather-widget-content">
          <div className="weather-current">
            <Row gutter={[16, 16]} align="middle">
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CloudOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{weather.location}</Title>
                    <Text type="secondary">{weather.condition}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <Statistic 
                  value={weather.temperature} 
                  suffix={weather.unit}
                  valueStyle={{ fontSize: '28px' }}
                />
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Statistic 
                  title="Humidity" 
                  value={weather.humidity} 
                  suffix="%" 
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CompassOutlined style={{ marginRight: '8px' }} />
                  <Statistic 
                    title="Wind" 
                    value={weather.windSpeed} 
                    suffix={`mph ${weather.windDirection}`}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </div>
              </Col>
            </Row>
          </div>
          
          {showForecast && (
            <div className="weather-forecast" style={{ marginTop: '16px' }}>
              <Title level={5}>Forecast</Title>
              <Row gutter={[8, 8]}>
                {weather.forecast.map((day: any, index: number) => (
                  <Col span={8} key={index}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Text strong>{day.day}</Text>
                        <div>
                          <Text>{day.high}{weather.unit}</Text> / <Text type="secondary">{day.low}{weather.unit}</Text>
                        </div>
                        <Text type="secondary">{day.condition}</Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default WeatherWidget;

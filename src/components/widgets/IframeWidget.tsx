import React, { useState, useEffect } from 'react';
import type { WidgetComponentProps } from '../../types';

/**
 * IframeWidget
 * 
 * A widget that renders remote content in an iframe to completely isolate it
 * from the main application's React context.
 */
const IframeWidget: React.FC<WidgetComponentProps> = ({ widget, isSelected }) => {
  const [iframeContent, setIframeContent] = useState<string>('');
  const { properties } = widget;
  const remoteUrl = properties.remoteUrl as string;
  
  useEffect(() => {
    if (!remoteUrl) {
      console.error('[IframeWidget] No remote URL provided for widget:', widget);
      return;
    }
    
    // Create a simple HTML page with the widget properties embedded as a global variable
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Remote Widget</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            height: 100vh;
            width: 100%;
            overflow: hidden;
          }
          .widget-container {
            padding: 16px;
            background-color: ${properties.backgroundColor || '#ffffff'};
            color: ${properties.textColor || '#000000'};
            border: ${isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
            border-radius: 4px;
            height: calc(100% - 32px);
            width: calc(100% - 32px);
            display: flex;
            flex-direction: column;
          }
          .widget-header {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 12px;
            border-bottom: 1px solid #d9d9d9;
            padding-bottom: 8px;
          }
          .widget-content {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }
          .widget-footer {
            margin-top: 8px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="widget-container">
          <div class="widget-header">${properties.title || 'Remote Widget'}</div>
          <div class="widget-content">${properties.content || 'This is a remote widget'}</div>
          <div class="widget-footer">Widget ID: ${widget.id}</div>
        </div>
        <script>
          // Make widget properties available to any scripts that might be loaded
          window.widgetProperties = ${JSON.stringify(properties)};
          window.widgetId = "${widget.id}";
          window.widgetType = "${widget.type}";
          
          // Listen for messages from the parent window
          window.addEventListener('message', (event) => {
            if (event.data.type === 'update-properties') {
              // Update the widget with new properties
              const newProps = event.data.properties;
              document.querySelector('.widget-header').textContent = newProps.title || 'Remote Widget';
              document.querySelector('.widget-content').textContent = newProps.content || 'This is a remote widget';
              document.querySelector('.widget-container').style.backgroundColor = newProps.backgroundColor || '#ffffff';
              document.querySelector('.widget-container').style.color = newProps.textColor || '#000000';
              window.widgetProperties = newProps;
            }
          });
        </script>
      </body>
      </html>
    `;
    
    setIframeContent(html);
  }, [widget, remoteUrl, isSelected, properties]);
  
  return (
    <iframe 
      srcDoc={iframeContent}
      style={{
        border: 'none',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
      title={`Remote Widget: ${widget.id}`}
      sandbox="allow-scripts"
    />
  );
};

export default IframeWidget;

# Remote Widget Integration Guide

This guide explains how to create and integrate remote widgets with the Dashboard Designer using the qiankun micro-frontend framework.

## Table of Contents

1. [Overview](#overview)
2. [Widget Manifest Format](#widget-manifest-format)
3. [Creating a Remote Widget](#creating-a-remote-widget)
4. [Widget Property Editors](#widget-property-editors)
5. [Integration with Qiankun](#integration-with-qiankun)
6. [Multi-Widget Remote Manifests](#multi-widget-remote-manifests)
7. [Deployment and Testing](#deployment-and-testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The Dashboard Designer supports remote widgets through a micro-frontend architecture powered by [qiankun](https://qiankun.umijs.org/). This allows developers to create widgets that are hosted on separate servers and dynamically loaded into the Dashboard Designer at runtime.

Key benefits of remote widgets:

- **Isolation**: Each widget runs in its own sandbox environment
- **Independent Development**: Widget teams can develop and deploy independently
- **Technology Agnostic**: Widgets can be built with different frameworks (React, Vue, etc.)
- **Dynamic Loading**: Widgets are loaded on-demand

## Widget Manifest Format

Each remote widget server must expose a `manifest.json` file at its root that describes the available widgets. The manifest format is as follows:

```json
{
  "version": "1.0.0",
  "author": "Your Name",
  "widgets": [
    {
      "type": "unique-widget-type",
      "name": "Display Name",
      "description": "Widget description",
      "path": "/widget-path",
      "defaultSize": [4, 3],
      "defaultProperties": {
        "title": "Widget Title",
        "customProperty": "value"
      },
      "hasPropertyEditor": true,
      "propertyEditorPath": "/widget-path/property-editor"
    }
  ]
}
```

### Manifest Fields

- **version**: Manifest version (semantic versioning recommended)
- **author**: Widget author or organization
- **widgets**: Array of widget definitions
  - **type**: Unique identifier for the widget type (used internally)
  - **name**: Display name shown in the widget marketplace
  - **description**: Widget description shown in the marketplace
  - **path**: Subpath where the widget is hosted (for multi-widget manifests)
  - **defaultSize**: Default grid size [width, height]
  - **defaultProperties**: Default widget properties
  - **hasPropertyEditor**: Whether the widget has a property editor
  - **propertyEditorPath**: Subpath where the property editor is hosted

## Creating a Remote Widget

### Project Setup

We recommend using Vite for building remote widgets. Here's a basic setup:

1. Create a new Vite project:

```bash
npm create vite@latest my-widget -- --template react-ts
cd my-widget
```

2. Install qiankun dependencies:

```bash
npm install qiankun
```

3. Create an entry file for qiankun integration (`src/entry.tsx`):

```tsx
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * bootstrap - required by qiankun
 */
export async function bootstrap() {
  console.log('[widget] bootstrapped');
}

/**
 * mount - required by qiankun
 * @param props - props passed from qiankun
 */
export async function mount(props: { container?: HTMLElement; [key: string]: any }) {
  console.log('[widget] mounted', props);
  const { container } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App {...props} />
    </React.StrictMode>
  );
}

/**
 * unmount - required by qiankun
 * @param props - props passed from qiankun
 */
export async function unmount(props: { container?: HTMLElement; [key: string]: any }) {
  console.log('[widget] unmounted');
  const { container } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (rootElement) {
    rootElement.innerHTML = '';
  }
}

/**
 * update - optional for qiankun
 * @param props - props passed from qiankun
 */
export async function update(props: { container?: HTMLElement; [key: string]: any }) {
  console.log('[widget] updated', props);
}
```

4. Create a public-path.js file:

```js
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

5. Update your main.tsx file:

```tsx
import './public-path';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Export the qiankun lifecycle hooks from entry.tsx
export { bootstrap, mount, unmount, update } from './entry';

// When running in standalone mode (not in qiankun)
if (!window.__POWERED_BY_QIANKUN__) {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
  } else {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}
```

6. Configure Vite for qiankun integration (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  base: './', // Use relative paths to support different subpaths
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/entry.tsx'),
      name: 'widgetName',
      formats: ['umd'],
      fileName: () => `widget-name`,
    },
    rollupOptions: {
      // Make sure we don't include React in the bundle
      external: ['react', 'react-dom'],
      output: {
        // Configure UMD build properly for qiankun
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

7. Create a manifest.json file in the public directory:

```json
{
  "version": "1.0.0",
  "author": "Your Name",
  "widgets": [
    {
      "type": "my-widget",
      "name": "My Widget",
      "description": "A custom widget for the Dashboard Designer",
      "path": "/",
      "defaultSize": [4, 3],
      "defaultProperties": {
        "title": "My Widget",
        "backgroundColor": "#ffffff"
      },
      "hasPropertyEditor": true,
      "propertyEditorPath": "/property-editor"
    }
  ]
}
```

## Widget Property Editors

Property editors allow users to customize widget properties through a UI. They are loaded as separate micro-apps when a widget is selected.

### Creating a Property Editor

1. Create a property editor component:

```tsx
// src/PropertyEditor.tsx
import React from 'react';

interface PropertyEditorProps {
  widgetProperties: Record<string, any>;
  onPropertyChange: (key: string, value: any) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ widgetProperties, onPropertyChange }) => {
  return (
    <div className="property-editor">
      <h3>Widget Properties</h3>
      
      <div className="property-group">
        <label>Title</label>
        <input
          type="text"
          value={widgetProperties.title || ''}
          onChange={(e) => onPropertyChange('title', e.target.value)}
        />
      </div>
      
      <div className="property-group">
        <label>Background Color</label>
        <input
          type="color"
          value={widgetProperties.backgroundColor || '#ffffff'}
          onChange={(e) => onPropertyChange('backgroundColor', e.target.value)}
        />
      </div>
    </div>
  );
};

export default PropertyEditor;
```

2. Create a property editor entry point:

```tsx
// src/property-editor/index.tsx
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom/client';
import PropertyEditor from '../PropertyEditor';

// Export qiankun lifecycle hooks
export async function bootstrap() {
  console.log('[property-editor] bootstrapped');
}

export async function mount(props: { container?: HTMLElement; [key: string]: any }) {
  console.log('[property-editor] mounted', props);
  const { container, widgetProperties, onPropertyChange } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PropertyEditor 
        widgetProperties={widgetProperties} 
        onPropertyChange={onPropertyChange}
      />
    </React.StrictMode>
  );
}

export async function unmount(props: { container?: HTMLElement; [key: string]: any }) {
  console.log('[property-editor] unmounted');
  const { container } = props;
  const rootElement = container ? container.querySelector('#root') : document.getElementById('root');
  
  if (rootElement) {
    rootElement.innerHTML = '';
  }
}

// When running in standalone mode (not in qiankun)
if (!window.__POWERED_BY_QIANKUN__) {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <PropertyEditor 
          widgetProperties={{
            title: 'Test Widget',
            backgroundColor: '#ffffff'
          }} 
          onPropertyChange={(key, value) => {
            console.log('Property changed:', key, value);
          }}
        />
      </React.StrictMode>
    );
  }
}
```

## Integration with Qiankun

The Dashboard Designer uses qiankun to load and manage remote widgets. Here's how the integration works:

1. When a remote widget URL is registered, the Dashboard Designer fetches the manifest.json file
2. For each widget in the manifest, the Dashboard Designer creates a widget definition
3. When a widget is added to the dashboard, the MicroAppContainer component loads it using qiankun
4. When a widget is selected, the MicroAppPropertyEditor component loads its property editor

### Widget Props

Remote widgets receive the following props from the Dashboard Designer:

- **widgetId**: Unique identifier for the widget instance
- **widgetType**: The widget type from the manifest
- **widgetProperties**: The current properties of the widget
- **isSelected**: Whether the widget is currently selected

### Property Editor Props

Property editors receive the following props:

- **widgetId**: Unique identifier for the widget instance
- **widgetType**: The widget type from the manifest
- **widgetProperties**: The current properties of the widget
- **onPropertyChange**: Function to update widget properties

## Multi-Widget Remote Manifests

The Dashboard Designer supports hosting multiple widgets on a single remote server, each with its own subpath. This is useful for organizing related widgets or sharing common code.

### Router Setup for Multi-Widget Support

To support multiple widgets, you need to set up a router in your widget project:

```tsx
// src/qiankun/router.tsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SimpleWidget from '../widgets/SimpleWidget';
import ChartWidget from '../widgets/ChartWidget';
import ThreeJSWidget from '../widgets/ThreeJSWidget';
import SimplePropertyEditor from '../property-editors/SimplePropertyEditor';
import ChartPropertyEditor from '../property-editors/ChartPropertyEditor';
import ThreeJSPropertyEditor from '../property-editors/ThreeJSPropertyEditor';

interface RouterProps {
  qiankunProps?: {
    widgetProperties?: Record<string, any>;
    onPropertyChange?: (key: string, value: any) => void;
    [key: string]: any;
  };
}

const AppRouter: React.FC<RouterProps> = ({ qiankunProps }) => {
  const location = useLocation();
  console.log('[AppRouter] Current path:', location.pathname);
  console.log('[AppRouter] Qiankun props:', qiankunProps);

  // Default mock props for standalone mode
  const mockProps = {
    widgetProperties: {
      title: 'Test Widget',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      content: 'This is a test widget'
    },
    onPropertyChange: (key: string, value: any) => {
      console.log('Property changed:', key, value);
    }
  };

  // Use qiankun props if available, otherwise use mock props
  const props = qiankunProps || mockProps;

  return (
    <Routes>
      {/* Widget Routes */}
      <Route path="/a" element={<SimpleWidget {...props} />} />
      <Route path="/b" element={<ChartWidget {...props} />} />
      <Route path="/c" element={<ThreeJSWidget {...props} />} />
      
      {/* Property Editor Routes */}
      <Route path="/a/property-editor" element={<SimplePropertyEditor {...props} />} />
      <Route path="/b/property-editor" element={<ChartPropertyEditor {...props} />} />
      <Route path="/c/property-editor" element={<ThreeJSPropertyEditor {...props} />} />
      
      {/* Default Route */}
      <Route path="*" element={<div>Select a widget or property editor path</div>} />
    </Routes>
  );
};

export default AppRouter;
```

## Deployment and Testing

### Building the Widget

```bash
npm run build
```

This will generate a UMD bundle in the `dist` directory that can be loaded by qiankun.

### Serving the Widget

You can use any static file server to host your widget. For testing, you can use:

```bash
npx http-server ./dist -p 5190 --cors
```

### Registering the Widget

1. In the Dashboard Designer, click on the "+" button to open the widget marketplace
2. Go to the "Remote Widgets" tab
3. Enter the URL of your widget server (e.g., `http://localhost:5190`)
4. Click "Register"

The Dashboard Designer will fetch the manifest.json file and register all widgets defined in it.

## Troubleshooting

### Common Issues

1. **Widget not loading**
   - Check browser console for errors
   - Verify that the widget server is running and accessible
   - Ensure CORS headers are properly set

2. **Qiankun entry script error**
   - Make sure your entry file exports all required lifecycle hooks
   - Check that the UMD bundle is being generated correctly
   - Verify that the entry point in the manifest is correct

3. **Property editor not loading**
   - Check that the propertyEditorPath in the manifest is correct
   - Ensure the property editor exports the required lifecycle hooks

4. **CSS conflicts**
   - Use scoped CSS or CSS modules to avoid conflicts with the Dashboard Designer
   - Consider using Shadow DOM for complete isolation

### Debugging Tips

1. Enable qiankun debug mode in the browser console:
   ```javascript
   localStorage.setItem('qiankun_log', true);
   ```

2. Check the network tab in browser dev tools to verify that the correct files are being loaded

3. Add console logs to the lifecycle hooks to track when they are called

4. Test your widget in standalone mode before integrating with the Dashboard Designer

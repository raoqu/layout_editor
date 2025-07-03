# Dashboard Designer

A flexible and powerful dashboard designer built with React, TypeScript, and Vite. This application allows users to create custom dashboards with drag-and-drop functionality using react-grid-layout.

## Features

- **Drag-and-Drop Interface**: Easily position and resize widgets on the dashboard
  - **Smart Widget Positioning**: Widgets maintain their original positions during drag operations when possible
  - **Intelligent Layout Compaction**: Horizontal compaction with position preservation to minimize unwanted layout shifts
- **Multiple Widget Types**: Text, Charts, Tables, and more
- **Container Widgets**: Cards that can contain nested layouts
  - **Nested Widget Management**: Full support for adding and removing widgets from nested containers
- **Property Editing**: Customize each widget's appearance and behavior
  - **Improved UI Controls**: Widget action buttons positioned in the header for better usability
- **Import/Export**: Save and load dashboard configurations as JSON
- **Responsive Design**: Layouts adapt to different screen sizes
- **Widget Marketplace**: Discover and install custom widgets from the marketplace
  - **Remote Widget Integration**: Load and run widgets from remote sources using qiankun micro-frontend framework

## Installation

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Setup

1. Clone the repository

```bash
git clone https://github.com/yourusername/dash_designer.git
cd dash_designer
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

## Usage

### Creating a Dashboard

1. Click the "Edit Mode" button to enable editing
2. Use the sidebar to add widgets to your dashboard
3. Drag and resize widgets to arrange them
4. Click on a widget to select it and edit its properties
5. Click "Exit Edit Mode" when you're done

### Widget Types

- **Text**: Display formatted text content
- **Chart**: Visualize data with bar or line charts
- **Table**: Display tabular data
- **Card**: Container widget that can hold other widgets

### Nested Layouts

Card widgets can contain their own layouts, allowing for complex dashboard designs. To add widgets to a card:

1. Add a Card widget to your dashboard
2. Select the Card widget
3. Click "Edit Properties" to customize the card
4. While in Edit Mode, click inside the card to add widgets to it

### Saving and Loading

- Click "Export" to save your dashboard configuration as JSON
- Click "Import" to load a previously saved configuration

### Widget Marketplace

The Dashboard Designer includes a widget marketplace that allows you to discover, install, and use custom widgets developed by third parties.

#### Using the Marketplace

1. Click on the "Marketplace" button in the sidebar
2. Browse available widgets or search for specific functionality
3. Click on a widget to view details
4. Click "Install" to add the widget to your dashboard
5. The widget will now be available in your widget list

#### Managing Remote Widget Sources

1. In the Marketplace, click on the "Remote Widget Sources" tab
2. View all registered remote widget URLs
3. Click "Add Widget Source" to register a new remote widget URL
4. Click "Refresh" next to a widget to update it from its source
5. Click "Refresh All" to update all registered widgets

Remote widget URLs are remembered between sessions, allowing you to easily update widgets when new versions are available.

#### Remote Widget Architecture

Dash Designer uses the [qiankun](https://qiankun.umijs.org/) micro-frontend framework to load and run remote widgets. This provides several benefits:

- **Isolation**: Each widget runs in its own sandbox environment
- **Independent Development**: Widget developers can work independently using their preferred tools
- **Dynamic Loading**: Widgets are loaded on-demand
- **Versioning**: Support for multiple versions of the same widget

#### Developing Remote Widgets

To create a compatible remote widget:

1. Create a standard web application using any framework
2. Implement the qiankun lifecycle hooks (`bootstrap`, `mount`, `unmount`, `update`)
3. Provide a `manifest.json` file with widget metadata
4. Optionally create a property editor component
5. Deploy your widget to a static hosting service

See the example widget template in the marketplace for a starting point.

## Changelog

### July 2025

#### Widget Marketplace and Remote Widget Integration
- Implemented a comprehensive widget marketplace for discovering and installing third-party widgets
- Transitioned to qiankun micro-frontend framework for loading remote widgets
- Removed legacy RemoteWidgetWrapper in favor of MicroAppContainer for better isolation and lifecycle management
- Added support for remote property editors through qiankun integration

#### Improved Widget Drag Behavior
- Added smart widget positioning system that preserves original widget positions during drag operations
- Implemented position optimization algorithm to minimize layout shifts when widgets are affected by dragging
- Restored horizontal compaction while preventing unwanted permanent layout changes
- Added drag state tracking to intelligently manage widget positions

#### Enhanced Nested Container Support
- Fixed "Remove Widget" functionality for widgets inside Card containers
- Added recursive helper function to find and remove widgets from any nested container
- Improved state management for nested layouts with proper immutability

#### UI Improvements
- Moved widget action buttons ("Edit Properties" and "Remove Widget") from content area to header bar
- Improved editing experience by maximizing available content area
- Fixed UI overlap issues that blocked widget interactions

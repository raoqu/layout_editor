# Dashboard Designer

A flexible and powerful dashboard designer built with React, TypeScript, and Vite. This application allows users to create custom dashboards with drag-and-drop functionality using react-grid-layout.

## Features

- **Drag-and-Drop Interface**: Easily position and resize widgets on the dashboard
- **Multiple Widget Types**: Text, Charts, Tables, and more
- **Container Widgets**: Cards that can contain nested layouts
- **Property Editing**: Customize each widget's appearance and behavior
- **Import/Export**: Save and load dashboard configurations as JSON
- **Responsive Design**: Layouts adapt to different screen sizes

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

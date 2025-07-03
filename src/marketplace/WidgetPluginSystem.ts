import React from 'react';
import type { WidgetDefinition } from '../types';
import type { RemoteWidgetManifest } from './types';
import WIDGET_REGISTRY from '../components/widgets/WidgetRegistry';
import { getWidgetDefinition } from '../components/widgets/WidgetRegistry';

/**
 * Widget Plugin System
 * Handles registration and management of external widgets
 */
class WidgetPluginSystem {
  private static instance: WidgetPluginSystem;
  private externalWidgets: Record<string, WidgetDefinition> = {};
  private installedWidgets: string[] = [];
  private remoteWidgetUrls: Record<string, string> = {};

  private constructor() {
    // Load installed widgets from localStorage
    this.loadInstalledWidgets();
    // Load remote widget URLs from localStorage
    this.loadRemoteWidgetUrls();
  }
  
  /**
   * Get the singleton instance of the WidgetPluginSystem
   */
  public static getInstance(): WidgetPluginSystem {
    if (!WidgetPluginSystem.instance) {
      WidgetPluginSystem.instance = new WidgetPluginSystem();
    }
    return WidgetPluginSystem.instance;
  }

  /**
   * Register an external widget with the system
   * @param widget Widget definition to register
   * @returns True if registration was successful
   */
  registerWidget(widget: WidgetDefinition): boolean {
    try {
      // Validate widget definition
      if (!this.validateWidgetDefinition(widget)) {
        console.error('Invalid widget definition:', widget);
        return false;
      }

      // Add to external widgets map
      this.externalWidgets[widget.type] = widget;
      console.log(`Widget ${widget.name} (${widget.type}) registered successfully`);
      return true;
    } catch (error) {
      console.error('Failed to register widget:', error);
      return false;
    }
  }

  /**
   * Install a widget, making it available in the dashboard
   * @param widgetType Type of widget to install
   * @returns True if installation was successful
   */
  installWidget(widgetType: string): boolean {
    try {
      // Check if widget exists in external registry
      if (!this.externalWidgets[widgetType]) {
        console.error(`Widget type ${widgetType} not found in external registry`);
        return false;
      }

      // Add to installed widgets
      if (!this.installedWidgets.includes(widgetType)) {
        this.installedWidgets.push(widgetType);
        this.saveInstalledWidgets();
      }

      console.log(`Widget ${widgetType} installed successfully`);
      return true;
    } catch (error) {
      console.error('Failed to install widget:', error);
      return false;
    }
  }

  /**
   * Uninstall a widget from the dashboard
   * @param widgetType Type of widget to uninstall
   * @returns True if uninstallation was successful
   */
  uninstallWidget(widgetType: string): boolean {
    try {
      // Remove from installed widgets
      const index = this.installedWidgets.indexOf(widgetType);
      if (index !== -1) {
        this.installedWidgets.splice(index, 1);
        this.saveInstalledWidgets();
      }

      console.log(`Widget ${widgetType} uninstalled successfully`);
      return true;
    } catch (error) {
      console.error('Failed to uninstall widget:', error);
      return false;
    }
  }

  /**
   * Get a widget definition by type, checking both built-in and external widgets
   * @param type Widget type to retrieve
   * @returns Widget definition or undefined if not found
   */
  getWidgetDefinition(type: string): WidgetDefinition | undefined {
    // First check external widgets
    if (this.externalWidgets[type]) {
      return this.externalWidgets[type];
    }

    // Fall back to built-in widgets
    return getWidgetDefinition(type);
  }

  /**
   * Get all widget definitions, including both built-in and external widgets
   */
  getAllWidgetDefinitions(): Record<string, WidgetDefinition> {
    // In a real implementation, this would merge with built-in widgets
    return this.externalWidgets;
  }

  /**
   * Register a remote widget by URL
   * @param url The URL to the remote widget manifest
   * @returns A promise that resolves to true if the widget was registered successfully
   */
  async registerRemoteWidget(url: string): Promise<boolean> {
    try {
      // Fetch the widget manifest from the remote URL
      const response = await fetch(`${url}/manifest.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch widget manifest: ${response.statusText}`);
      }

      const manifest: RemoteWidgetManifest = await response.json();

      // Validate the manifest
      if (!manifest.type || !manifest.name || !manifest.version) {
        throw new Error('Invalid widget manifest: missing required fields');
      }

      // Create a widget definition from the manifest
      const widgetDefinition: WidgetDefinition = {
        type: manifest.type,
        name: manifest.name,
        // Use a dynamic import for the icon
        icon: React.createElement('div', null, '📦'),
        defaultSize: manifest.defaultSize || [4, 3],
        defaultProperties: manifest.defaultProperties || {},
        // Use dynamic imports for the component and property editor
        component: React.lazy(() => import(/* @vite-ignore */ `${url}/widget.js`).then(module => ({ default: module.default }))),
        propertyEditor: manifest.hasPropertyEditor ? 
          React.lazy(() => import(/* @vite-ignore */ `${url}/property-editor.js`).then(module => ({ default: module.default }))) : 
          undefined,
        isRemote: true,
        remoteUrl: url
      };

      // Register the widget
      const success = this.registerWidget(widgetDefinition);

      if (success) {
        // Store the remote URL
        this.remoteWidgetUrls[manifest.type] = url;
        this.saveRemoteWidgetUrls();
      }

      return success;
    } catch (error) {
      console.error('Failed to register remote widget:', error);
      return false;
    }
  }

  /**
   * Validate a widget definition to ensure it has all required properties
   * @param widget Widget definition to validate
   * @returns True if widget definition is valid
   */
  private validateWidgetDefinition(widget: WidgetDefinition): boolean {
    // Check required properties
    if (!widget.type || !widget.name || !widget.component) {
      return false;
    }

    // Check for type conflicts with built-in widgets
    if (Object.keys(WIDGET_REGISTRY).includes(widget.type)) {
      console.warn(`Widget type ${widget.type} conflicts with a built-in widget`);
      return false;
    }

    return true;
  }

  /**
   * Save installed widgets to localStorage
   */
  private saveInstalledWidgets(): void {
    try {
      localStorage.setItem('installedWidgets', JSON.stringify(this.installedWidgets));
    } catch (error) {
      console.error('Failed to save installed widgets:', error);
    }
  }

  private saveRemoteWidgetUrls(): void {
    try {
      localStorage.setItem('remoteWidgetUrls', JSON.stringify(this.remoteWidgetUrls));
    } catch (error) {
      console.error('Failed to save remote widget URLs:', error);
    }
  }

  /**
   * Load installed widgets from localStorage
   */
  private loadInstalledWidgets(): void {
    try {
      const installedWidgetsJson = localStorage.getItem('installedWidgets');
      if (installedWidgetsJson) {
        this.installedWidgets = JSON.parse(installedWidgetsJson);
      }
    } catch (error) {
      console.error('Failed to load installed widgets:', error);
      this.installedWidgets = [];
    }
  }

  private loadRemoteWidgetUrls(): void {
    try {
      const remoteWidgetUrlsJson = localStorage.getItem('remoteWidgetUrls');
      if (remoteWidgetUrlsJson) {
        this.remoteWidgetUrls = JSON.parse(remoteWidgetUrlsJson);
      }
    } catch (error) {
      console.error('Failed to load remote widget URLs:', error);
      this.remoteWidgetUrls = {};
    }
  }

  // Instance methods and properties are defined above
}

// Export the singleton instance getter
export default WidgetPluginSystem.getInstance();

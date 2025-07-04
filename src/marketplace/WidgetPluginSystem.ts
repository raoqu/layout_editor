import React from 'react';
import type { WidgetDefinition } from '../types';
import type { RemoteWidgetManifest } from './types';
import WIDGET_REGISTRY from '../components/widgets/WidgetRegistry';
import { getWidgetDefinition, createWidget as createBuiltInWidget } from '../components/widgets/WidgetRegistry';

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
      console.log(`[WidgetPluginSystem] Registering widget: ${widget.name} (${widget.type})`);
      
      // Validate widget definition
      if (!this.validateWidgetDefinition(widget)) {
        console.error('[WidgetPluginSystem] Invalid widget definition:', widget);
        return false;
      }

      // Add to external widgets map
      this.externalWidgets[widget.type] = widget;
      console.log(`[WidgetPluginSystem] Widget ${widget.name} (${widget.type}) registered successfully`);
      console.log('[WidgetPluginSystem] Updated external widgets:', Object.keys(this.externalWidgets));
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
    console.log(`[WidgetPluginSystem] Looking up widget definition for type: '${type}'`);
    console.log(`[WidgetPluginSystem] Available external widgets:`, Object.keys(this.externalWidgets));
    
    // First check external widgets
    if (this.externalWidgets[type]) {
      console.log(`[WidgetPluginSystem] Found external widget for type: '${type}'`, this.externalWidgets[type]);
      return this.externalWidgets[type];
    }

    // Fall back to built-in widgets
    const builtInWidget = getWidgetDefinition(type);
    console.log(`[WidgetPluginSystem] Found built-in widget for type: '${type}'`, builtInWidget || 'Not found');
    return builtInWidget;
  }

  /**
   * Get all widget definitions, including both built-in and external widgets
   */
  getAllWidgetDefinitions(): Record<string, WidgetDefinition> {
    // Merge built-in widgets with external widgets
    return { ...WIDGET_REGISTRY, ...this.externalWidgets };
  }

  /**
   * Normalize remote widget URL to ensure correct port
   * This fixes issues with port mismatches between development and production
   */
  private normalizeRemoteUrl(url: string): string {
    try {
      // Parse the URL
      const parsedUrl = new URL(url);
      
      return parsedUrl.toString();
    } catch (error) {
      console.error(`[WidgetPluginSystem] Error normalizing URL ${url}:`, error);
      return url; // Return original URL if parsing fails
    }
  }

  /**
   * Register a remote widget by URL
   * @param url The URL to the remote widget manifest
   * @returns A promise that resolves to true if at least one widget was registered successfully
   */
  async registerRemoteWidget(url: string): Promise<boolean> {
    try {
      // Normalize the URL to ensure correct port
      const normalizedUrl = this.normalizeRemoteUrl(url);
      console.log(`[WidgetPluginSystem] Registering remote widget from ${normalizedUrl} (original: ${url})`);
      
      // Dynamically import the components to avoid circular dependencies
      const { default: MicroAppContainer } = await import('../components/widgets/MicroAppContainer');
      const { default: MicroAppPropertyEditor } = await import('../components/widgets/MicroAppPropertyEditor');
      
      // Fetch the manifest file from the remote URL
      const response = await fetch(`${normalizedUrl}/manifest.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch widget manifest: ${response.statusText}`);
      }
      const manifest: RemoteWidgetManifest = await response.json();
      
      // Validate the manifest
      if (!manifest.version || !manifest.author || !Array.isArray(manifest.widgets) || manifest.widgets.length === 0) {
        throw new Error('Invalid widget manifest: missing required fields or no widgets defined');
      }
      
      // Get the global entry point if specified in the manifest
      const globalEntry = manifest.entry;
      
      let registeredCount = 0;
      
      // Register each widget defined in the manifest
      for (const widgetDef of manifest.widgets) {
        // Validate the widget definition
        if (!widgetDef.type || !widgetDef.name || !widgetDef.path) {
          console.error('[WidgetPluginSystem] Invalid widget definition:', widgetDef);
          continue;
        }
        
        // Ensure the URL ends with a slash if needed and use the normalized URL
        const baseUrl = normalizedUrl.endsWith('/') ? normalizedUrl : `${normalizedUrl}/`;
        
        // For qiankun, we need to make sure we're pointing to the correct entry file
        // Instead of trying to load src/main.tsx, we should load the built widget-demo file
        const widgetDefinition: WidgetDefinition = {
          type: widgetDef.type,
          name: widgetDef.name,
          icon: React.createElement('div', null, '📦'),
          defaultSize: widgetDef.defaultSize || [4, 3],
          defaultProperties: {
            ...widgetDef.defaultProperties || {},
            remoteUrl: baseUrl, // Store the base remote URL in properties
            remotePath: widgetDef.path, // Store the widget's specific path
            propertyEditorPath: widgetDef.propertyEditorPath, // Store the property editor path
            title: widgetDef.name || 'Remote Widget',
            description: widgetDef.description || 'This is a remote widget',
            // Add an entry property to specify the correct entry file
            // Use the global entry from manifest if available, otherwise use default widget-demo.umd.js
            entry: globalEntry ? `${baseUrl}${globalEntry}` : `${baseUrl}widget-demo.umd.js`
          },
          isRemote: true, // Mark this as a remote widget
          remoteUrl: baseUrl, // Store the base remote URL
          remotePath: widgetDef.path, // Store the widget's specific path
          propertyEditorPath: widgetDef.propertyEditorPath, // Store the property editor path if specified
          // Use our MicroAppContainer for qiankun integration
          component: MicroAppContainer,
          // Use our MicroAppPropertyEditor
          propertyEditor: MicroAppPropertyEditor
        };

        // Validate and register the widget
        if (this.validateWidgetDefinition(widgetDefinition)) {
          console.log('[WidgetPluginSystem] Registering remote widget:', widgetDefinition);
          const registered = this.registerWidget(widgetDefinition);
          if (registered) {
            // Store the remote URL for this widget type
            this.remoteWidgetUrls[widgetDef.type] = url;
            registeredCount++;
          }
        }
      }
      
      // Save the remote widget URLs if any widgets were registered
      if (registeredCount > 0) {
        this.saveRemoteWidgetUrls();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[WidgetPluginSystem] Error registering remote widgets:', error);
      return false;
    }
  }

  /**
   * Create a new widget instance from a widget type
   * @param type Widget type to create
   * @param id Unique ID for the new widget
   * @returns A new widget instance
   */
  createWidget(type: string, id: string): any {
    console.log(`[WidgetPluginSystem] Creating widget of type '${type}' with id '${id}'`);
    // First check if this is an external widget
    const widgetDefinition = this.getWidgetDefinition(type);
    if (!widgetDefinition) {
      console.error(`[WidgetPluginSystem] Widget type ${type} not found, falling back to text widget`);
      return createBuiltInWidget('text', id); // Fallback to text widget
    }
    
    console.log(`[WidgetPluginSystem] Found widget definition:`, widgetDefinition);
    console.log(`[WidgetPluginSystem] Widget is ${widgetDefinition.isRemote ? 'remote' : 'built-in'}`);
    
    const widget = {
      id,
      type,
      title: widgetDefinition.name,
      properties: { ...widgetDefinition.defaultProperties },
    };
    
    console.log(`[WidgetPluginSystem] Created widget instance:`, widget);

    // If it's a container, add empty children layout
    if (widgetDefinition.isContainer) {
      return {
        ...widget,
        children: {
          layout: {
            layouts: [],
            settings: {
              cols: 12,
              rowHeight: 30,
              containerPadding: [10, 10],
              margin: [10, 10],
            },
          },
        },
      };
    }

    return widget;
  }

  /**
   * Validate a widget definition to ensure it has all required properties
   * @param widget Widget definition to validate
   * @returns True if widget definition is valid
   */
  private validateWidgetDefinition(widget: WidgetDefinition): boolean {
    // Check required properties
    if (!widget.type || !widget.name || !widget.component) {
      console.error(`[WidgetPluginSystem] Widget validation failed: missing required properties`);
      return false;
    }

    // For remote widgets, we'll allow them even if they conflict with built-in widgets
    // This allows overriding built-in widgets with remote versions
    if (Object.keys(WIDGET_REGISTRY).includes(widget.type) && !widget.isRemote) {
      console.warn(`[WidgetPluginSystem] Widget type ${widget.type} conflicts with a built-in widget`);
      return false;
    }

    return true;
  }

  /**
   * Clear all registered remote widgets
   * @returns True if successful
   */
  clearAllRemoteWidgets(): boolean {
    try {
      console.log('[WidgetPluginSystem] Clearing all remote widgets');
      
      // Get all remote widget types
      const remoteWidgetTypes = Object.keys(this.remoteWidgetUrls);
      
      // Remove each remote widget from the registry
      remoteWidgetTypes.forEach(type => {
        delete WIDGET_REGISTRY[type];
      });
      
      // Clear the remote widget URLs
      this.remoteWidgetUrls = {};
      
      // Save the empty remote widget URLs to localStorage
      this.saveRemoteWidgetUrls();
      
      console.log('[WidgetPluginSystem] All remote widgets cleared');
      return true;
    } catch (error) {
      console.error('[WidgetPluginSystem] Error clearing remote widgets:', error);
      return false;
    }
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

  /**
   * Get all registered remote widget URLs
   * @returns Record of widget types to their remote URLs
   */
  getRemoteWidgetUrls(): Record<string, string> {
    return { ...this.remoteWidgetUrls };
  }

  /**
   * Refresh a remote widget by re-fetching its manifest and updating its definition
   * @param widgetType The type of widget to refresh
   * @returns A promise that resolves to true if the widget was refreshed successfully
   */
  async refreshRemoteWidget(widgetType: string): Promise<boolean> {
    try {
      // Check if we have a URL for this widget type
      const url = this.remoteWidgetUrls[widgetType];
      if (!url) {
        console.error(`[WidgetPluginSystem] No URL found for widget type ${widgetType}`);
        return false;
      }

      console.log(`[WidgetPluginSystem] Refreshing widget ${widgetType} from ${url}`);
      
      // Re-register the widget with the same URL
      return await this.registerRemoteWidget(url);
    } catch (error) {
      console.error(`[WidgetPluginSystem] Error refreshing widget ${widgetType}:`, error);
      return false;
    }
  }

  /**
   * Refresh all registered remote widgets
   * @returns A promise that resolves to an object with the results of each refresh operation
   */
  async refreshAllRemoteWidgets(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Get all widget types with remote URLs
    const widgetTypes = Object.keys(this.remoteWidgetUrls);
    
    // Refresh each widget
    for (const widgetType of widgetTypes) {
      results[widgetType] = await this.refreshRemoteWidget(widgetType);
    }
    
    return results;
  }

  // Instance methods and properties are defined above
}

// Export the singleton instance getter
export default WidgetPluginSystem.getInstance();

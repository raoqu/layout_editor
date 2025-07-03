import type { WidgetDefinition } from '../types';
import WIDGET_REGISTRY from '../components/widgets/WidgetRegistry';
import { getWidgetDefinition } from '../components/widgets/WidgetRegistry';

/**
 * Widget Plugin System
 * Handles registration and management of external widgets
 */
class WidgetPluginSystem {
  private externalWidgets: Map<string, WidgetDefinition> = new Map();
  private installedWidgets: string[] = [];

  constructor() {
    // Load any previously installed widgets from localStorage
    this.loadInstalledWidgets();
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
      this.externalWidgets.set(widget.type, widget);
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
      if (!this.externalWidgets.has(widgetType)) {
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
    if (this.externalWidgets.has(type)) {
      return this.externalWidgets.get(type);
    }

    // Fall back to built-in widgets
    return getWidgetDefinition(type);
  }

  /**
   * Get all available widget definitions (both built-in and installed external)
   * @returns Array of widget definitions
   */
  getAllWidgetDefinitions(): WidgetDefinition[] {
    const builtInWidgets = Object.values(WIDGET_REGISTRY);
    
    // Get installed external widgets
    const externalWidgets = this.installedWidgets
      .map(type => this.externalWidgets.get(type))
      .filter(widget => widget !== undefined) as WidgetDefinition[];
    
    return [...builtInWidgets, ...externalWidgets];
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

  /**
   * Load installed widgets from localStorage
   */
  private loadInstalledWidgets(): void {
    try {
      const saved = localStorage.getItem('installedWidgets');
      if (saved) {
        this.installedWidgets = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load installed widgets:', error);
    }
  }
}

// Create singleton instance
const widgetPluginSystem = new WidgetPluginSystem();
export default widgetPluginSystem;

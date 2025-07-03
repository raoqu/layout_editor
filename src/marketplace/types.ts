import type { WidgetDefinition } from '../types';

export interface MarketplaceWidgetMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  rating: number;
}

export interface MarketplaceWidgetInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  thumbnail?: string;
  downloads: number;
  rating: number;
  isInstalled?: boolean;
}

/**
 * Remote Widget Manifest definition
 * This is the format expected from remote widget servers
 */
export interface RemoteWidgetManifest {
  type: string;
  name: string;
  description: string;
  version: string;
  author: string;
  defaultSize?: [number, number];
  defaultProperties?: Record<string, any>;
  hasPropertyEditor?: boolean;
}

export interface MarketplaceWidget extends MarketplaceWidgetMetadata {
  widgetDefinition: WidgetDefinition;
  source?: string; // Source code if available
  isInstalled?: boolean;
}

export interface MarketplaceResponse {
  widgets: MarketplaceWidgetMetadata[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface MarketplaceService {
  fetchWidgets(page: number, pageSize: number, filters?: WidgetFilters): Promise<MarketplaceResponse>;
  getWidgetDetails(id: string): Promise<MarketplaceWidget>;
  installWidget(id: string): Promise<boolean>;
}

export interface WidgetFilters {
  query?: string;
  tags?: string[];
  author?: string;
  sortBy?: 'popular' | 'recent' | 'rating';
}

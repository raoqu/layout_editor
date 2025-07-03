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

export interface MarketplaceWidget extends MarketplaceWidgetMetadata {
  widgetDefinition: WidgetDefinition;
  source?: string; // Source code if available
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

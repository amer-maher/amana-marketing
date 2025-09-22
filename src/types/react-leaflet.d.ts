// TypeScript module declaration for react-leaflet v5+ to suppress prop errors for common map components
// This allows use of center, attribution, radius, direction, etc. on MapContainer, TileLayer, CircleMarker, Tooltip

declare module 'react-leaflet' {
  import * as React from 'react';
  import { Map as LeafletMap, TileLayer as LeafletTileLayer, CircleMarker as LeafletCircleMarker, Tooltip as LeafletTooltip } from 'leaflet';

  export interface MapContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    center: [number, number];
    zoom: number;
    scrollWheelZoom?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  export const MapContainer: React.FC<MapContainerProps>;

  export interface TileLayerProps {
    attribution?: string;
    url: string;
    children?: React.ReactNode;
  }
  export const TileLayer: React.FC<TileLayerProps>;

  export interface CircleMarkerProps {
    center: [number, number];
    radius?: number;
    pathOptions?: any;
    children?: React.ReactNode;
  }
  export const CircleMarker: React.FC<CircleMarkerProps>;

  export interface TooltipProps {
    direction?: string;
    offset?: [number, number];
    opacity?: number;
    permanent?: boolean;
    children?: React.ReactNode;
  }
  export const Tooltip: React.FC<TooltipProps>;
}

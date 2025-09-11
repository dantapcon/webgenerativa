/**
 * Declaraciones de tipos para Google Maps JavaScript API
 * Esto evita errores de TypeScript al usar Google Maps en archivos JavaScript
 */

declare global {
  interface Window {
    google?: typeof google;
  }
  
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options: any);
        setZoom(zoom: number): void;
        getZoom(): number;
        fitBounds(bounds: LatLngBounds): void;
      }
      
      class Marker {
        constructor(options: any);
        setMap(map: Map | null): void;
        addListener(event: string, handler: () => void): void;
      }
      
      class InfoWindow {
        constructor(options: any);
        open(map: Map, marker: Marker): void;
        close(): void;
      }
      
      class LatLngBounds {
        constructor();
        extend(point: { lat: number; lng: number }): void;
      }
      
      namespace event {
        function addListener(instance: any, eventName: string, handler: () => void): any;
        function removeListener(listener: any): void;
      }
      
      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain'
      }
      
      namespace SymbolPath {
        const CIRCLE: string;
      }
    }
  }
}

export {};

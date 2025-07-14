import { useEffect, useRef } from "react";
import type { Tree } from "@shared/schema";

interface TreeMapProps {
  trees: Tree[];
  onMarkerClick?: (tree: Tree) => void;
  center?: [number, number];
  zoom?: number;
}

export default function TreeMap({ 
  trees, 
  onMarkerClick, 
  center = [40.7829, -73.9654], 
  zoom = 13 
}: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;
      
      const L = await import("leaflet");
      
      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Create map if it doesn't exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Add tree markers
      trees.forEach(tree => {
        const color = tree.condition === 'excellent' ? '#10b981' : 
                     tree.condition === 'fair' ? '#f59e0b' : '#ef4444';
        
        const marker = L.circleMarker([tree.latitude, tree.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstanceRef.current);

        const conditionEmoji = tree.condition === 'excellent' ? '😊' : 
                              tree.condition === 'fair' ? '😐' : '☹️';

        const conditionText = tree.condition === 'excellent' ? '우수' : 
                               tree.condition === 'fair' ? '보통' : '나쁨';

        marker.bindPopup(`
          <div class="p-3 min-w-48">
            <h3 class="font-semibold text-lg mb-2">${tree.species} 나무</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-medium">상태:</span> ${conditionText} ${conditionEmoji}</p>
              ${tree.diameter ? `<p><span class="font-medium">직경:</span> ${tree.diameter} 인치</p>` : ''}
              ${tree.height ? `<p><span class="font-medium">높이:</span> ${tree.height}</p>` : ''}
              <p><span class="font-medium">등록자:</span> ${tree.contributor}님</p>
              <p class="text-gray-500">${new Date(tree.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        `);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(tree));
        }

        markersRef.current.push(marker);
      });
    };

    initMap();

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
    };
  }, [trees, center, zoom, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-full" />;
}

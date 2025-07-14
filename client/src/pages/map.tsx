import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Filter, Crosshair, Layers } from "lucide-react";
import TreeMap from "@/components/tree-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Tree } from "@shared/schema";

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const { data: trees = [], isLoading } = useQuery<Tree[]>({
    queryKey: ["/api/trees", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/trees?${params}`);
      if (!response.ok) throw new Error("Failed to fetch trees");
      return response.json();
    },
  });

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <TreeMap 
        trees={trees} 
        center={userLocation || [40.7829, -73.9654]}
        zoom={13}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg elevation-2 p-2 space-y-2">
        <Button
          size="icon"
          onClick={getCurrentLocation}
          className="w-10 h-10 bg-primary text-white hover:bg-primary/90"
          title="현재 위치"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10"
          title="레이어 전환"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-20 right-4 md:left-20 md:right-auto md:w-80">
        <Card className="bg-white elevation-2 flex items-center px-4 py-3">
          <Search className="h-4 w-4 text-gray-400 mr-3" />
          <Input
            type="text"
            placeholder="위치나 나무 종류를 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent outline-none focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-gray-600">
            <Filter className="h-4 w-4" />
          </Button>
        </Card>
      </div>

      {/* Add Tree Floating Button */}
      <Link href="/add">
        <Button
          size="lg"
          className="floating-button fixed bottom-20 md:bottom-8 right-6 w-14 h-14 rounded-full elevation-3 bg-accent hover:bg-accent/90 p-0 z-50"
          title="새 나무 추가"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      {/* Map Legend */}
      <Card className="absolute bottom-20 md:bottom-8 left-4 bg-white elevation-2 p-4 z-40">
        <h3 className="font-medium text-gray-800 mb-2">범례</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>우수</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span>보통</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>나쁨</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

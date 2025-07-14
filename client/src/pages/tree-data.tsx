import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import TreeCard from "@/components/tree-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tree, TreeSpecies } from "@shared/schema";

export default function TreeDataPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const { data: trees = [], isLoading, error } = useQuery<Tree[]>({
    queryKey: ["/api/trees", searchQuery, speciesFilter, conditionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (speciesFilter !== "all") params.append("species", speciesFilter);
      if (conditionFilter !== "all") params.append("condition", conditionFilter);
      
      const response = await fetch(`/api/trees?${params}`);
      if (!response.ok) throw new Error("Failed to fetch trees");
      return response.json();
    },
  });

  const { data: treeSpecies = [] } = useQuery<TreeSpecies[]>({
    queryKey: ["/api/tree-species"],
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-600">나무 데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">나무 데이터베이스</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="나무 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="모든 종류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 종류</SelectItem>
              {treeSpecies.map((species) => (
                <SelectItem key={species.name} value={species.name}>
                  {species.icon} {species.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="모든 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="excellent">우수</SelectItem>
              <SelectItem value="fair">보통</SelectItem>
              <SelectItem value="poor">나쁨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tree Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg elevation-1 p-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery || speciesFilter !== "all" || conditionFilter !== "all" 
              ? "검색 조건에 맞는 나무를 찾을 수 없습니다."
              : "아직 등록된 나무가 없습니다. 첫 번째 나무를 등록해 보세요!"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      )}

      {/* Pagination placeholder */}
      {trees.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button className="bg-primary text-white">1</Button>
            <Button variant="ghost" disabled>2</Button>
            <Button variant="ghost" disabled>3</Button>
            <Button variant="ghost" size="icon" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



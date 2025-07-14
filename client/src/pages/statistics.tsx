import { useQuery } from "@tanstack/react-query";
import { TreePine, Users, Smile, Meh, Frown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsData {
  totalTrees: number;
  species: number;
  contributors: number;
  healthyPercentage: number;
  speciesDistribution: Record<string, number>;
  conditionDistribution: Record<string, number>;
  recentTrees: Array<{
    id: number;
    species: string;
    contributor: string;
    createdAt: string;
    condition: string;
  }>;
}

export default function StatisticsPage() {
  const { data: stats, isLoading, error } = useQuery<StatisticsData>({
    queryKey: ["/api/trees/stats/overview"],
    queryFn: async () => {
      const response = await fetch("/api/trees/stats/overview");
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json();
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-600">통계를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">나무 통계</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-3xl font-bold text-primary mb-2">{stats?.totalTrees.toLocaleString()}</div>
            )}
            <div className="text-sm text-gray-600">전체 나무</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-3xl font-bold text-secondary mb-2">{stats?.species}</div>
            )}
            <div className="text-sm text-gray-600">종류</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
            ) : (
              <div className="text-3xl font-bold text-accent mb-2">{stats?.contributors}</div>
            )}
            <div className="text-sm text-gray-600">참여자</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
            ) : (
              <div className="text-3xl font-bold text-green-600 mb-2">{stats?.healthyPercentage}%</div>
            )}
            <div className="text-sm text-gray-600">건강함</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TreePine className="h-5 w-5 mr-2" />
              종류별 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-2 w-32" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats?.speciesDistribution || {})
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([species, count]) => {
                    const percentage = stats?.totalTrees ? (count / stats.totalTrees) * 100 : 0;
                    return (
                      <div key={species} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{species}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-32" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tree Condition */}
        <Card>
          <CardHeader>
            <CardTitle>나무 상태</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-5 mr-3" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Smile className="h-5 w-5 text-green-500 mr-3" />
                    <span className="font-medium text-gray-800">우수</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {stats?.conditionDistribution.excellent || 0} 
                    {stats?.totalTrees && (
                      <span className="text-sm ml-1">
                        ({Math.round(((stats.conditionDistribution.excellent || 0) / stats.totalTrees) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Meh className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="font-medium text-gray-800">보통</span>
                  </div>
                  <span className="font-bold text-yellow-600">
                    {stats?.conditionDistribution.fair || 0}
                    {stats?.totalTrees && (
                      <span className="text-sm ml-1">
                        ({Math.round(((stats.conditionDistribution.fair || 0) / stats.totalTrees) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <Frown className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium text-gray-800">나쁨</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {stats?.conditionDistribution.poor || 0}
                    {stats?.totalTrees && (
                      <span className="text-sm ml-1">
                        ({Math.round(((stats.conditionDistribution.poor || 0) / stats.totalTrees) * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            최근 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-l-4 border-gray-200 bg-gray-50">
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : stats?.recentTrees.length === 0 ? (
            <p className="text-gray-500 text-center py-4">최근 활동이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentTrees.map((tree) => {
                const borderColor = tree.condition === 'excellent' ? 'border-green-500' : 
                                   tree.condition === 'fair' ? 'border-yellow-500' : 'border-red-500';
                return (
                  <div key={tree.id} className={`flex items-center justify-between p-3 border-l-4 ${borderColor} bg-gray-50`}>
                    <div>
                      <p className="font-medium text-gray-800">새로운 {tree.species} 나무가 추가됨</p>
                      <p className="text-sm text-gray-600">상태: {tree.condition === 'excellent' ? '우수' : tree.condition === 'fair' ? '보통' : '나쁨'} • {tree.contributor}님이 추가</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(tree.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

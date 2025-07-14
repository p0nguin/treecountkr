import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Leaf, User, Heart, GraduationCap, TreePine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { User as UserType, Badge, Tree } from "@shared/schema";

const getTreeIcon = (count: number) => {
  if (count < 10) return <Leaf className="h-5 w-5 text-green-600" />;
  if (count < 50) return <TreePine className="h-5 w-5 text-green-700" />;
  return <TreePine className="h-5 w-5 text-green-800" />;
};

const getBadgeIcon = (badgeType: string) => {
  if (badgeType === "education") return <GraduationCap className="h-5 w-5 text-blue-500" />;
  if (badgeType === "tree_count") return <Leaf className="h-5 w-5 text-green-500" />;
  return <Trophy className="h-5 w-5 text-yellow-500" />;
};

export default function MyPage() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  const { data: userBadges = [], isLoading: badgesLoading, error: badgesError } = useQuery<Badge[]>({
    queryKey: ["/api/users/temp_user/badges"], // Temporarily use temp_user
  });

  const { data: userTrees = [], isLoading: userTreesLoading, error: userTreesError } = useQuery<Tree[]>({
    queryKey: ["/api/users/temp_user/trees"], // Temporarily use temp_user
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{ totalTrees: number; species: number; healthyPercentage: number; contributors: number }>({
    queryKey: ["/api/trees/stats/overview"],
  });

  if (userLoading || badgesLoading || userTreesLoading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (userError || badgesError || userTreesError || statsError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }

  const treeCountByType: { [key: string]: number } = {};
  userTrees.forEach(tree => {
    treeCountByType[tree.species] = (treeCountByType[tree.species] || 0) + 1;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">마이페이지</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록한 나무</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTrees.length} 그루</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">획득 배지</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBadges.length} 개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 참여자 수</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.contributors || 0} 명</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">내 나무 기록</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(treeCountByType).map(([species, count]) => (
          <Card key={species}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {species} {getTreeIcon(count)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{count} 그루</p>
            </CardContent>
          </Card>
        ))}
        {Object.keys(treeCountByType).length === 0 && (
          <p className="text-gray-500">아직 등록된 나무가 없습니다.</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">획득한 배지</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {userBadges.map(badge => (
          <Card key={badge.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {badge.name} {getBadgeIcon(badge.type)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{badge.description}</p>
            </CardContent>
          </Card>
        ))}
        {userBadges.length === 0 && (
          <p className="text-gray-500">아직 획득한 배지가 없습니다.</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">전체 현황</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 나무 수</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTrees || 0} 그루</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">나무 종류</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.species || 0} 종</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">건강한 나무</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.healthyPercentage || 0}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



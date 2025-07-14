import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TreePine, Plus, MapPin, BarChart3, Award } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/trees/stats/overview"]
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          안녕하세요, {user?.firstName || user?.email}님!
        </h1>
        <p className="text-gray-600">
          오늘도 우리 동네 나무를 함께 보호해주세요.
        </p>
      </div>

      {/* User Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">등록한 나무</p>
              <p className="text-2xl font-bold">{user?.treeCount || 0}그루</p>
            </div>
            <TreePine className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">승인된 나무</p>
              <p className="text-2xl font-bold">{user?.approvedTreeCount || 0}그루</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">획득 배지</p>
              <p className="text-2xl font-bold">{user?.badges?.length || 0}개</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* User Badges */}
      {user?.badges && user.badges.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">획득한 배지</h2>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((userBadge: any) => (
              <Badge key={userBadge.badge.id} variant="secondary" className="px-3 py-1">
                {userBadge.badge.icon} {userBadge.badge.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/add">
            <Button className="w-full h-20 flex flex-col gap-2">
              <Plus className="w-6 h-6" />
              <span>나무 등록</span>
            </Button>
          </Link>

          <Link href="/map">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <MapPin className="w-6 h-6" />
              <span>지도 보기</span>
            </Button>
          </Link>

          <Link href="/data">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <TreePine className="w-6 h-6" />
              <span>나무 데이터</span>
            </Button>
          </Link>

          <Link href="/stats">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>통계</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* Overall Stats */}
      {stats && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">전체 현황</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">총 나무 수</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalTrees}그루</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">나무 종류</p>
              <p className="text-2xl font-bold text-blue-600">{stats.species}종</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">참여자 수</p>
              <p className="text-2xl font-bold text-purple-600">{stats.contributors}명</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">건강한 나무</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.healthyPercentage}%</p>
            </div>
          </div>
        </Card>
      )}

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/api/logout'}
        >
          로그아웃
        </Button>
      </div>
    </div>
  );
}
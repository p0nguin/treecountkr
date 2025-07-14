import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TreePine, Users, MapPin, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <TreePine className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            나무세기
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            시민 참여형 나무 조사 플랫폼에 오신 것을 환영합니다. 우리 동네의 나무를 함께 기록하고 보호해요.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = '/api/login'}
          >
            시작하기
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center">
            <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">나무 지도</h3>
            <p className="text-gray-600">
              우리 동네의 모든 나무를 지도에서 확인하고 상태를 파악할 수 있습니다.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">시민 참여</h3>
            <p className="text-gray-600">
              누구나 쉽게 나무 정보를 등록하고 관리에 참여할 수 있습니다.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">배지 시스템</h3>
            <p className="text-gray-600">
              나무 조사 활동에 참여하고 다양한 배지를 획득해보세요.
            </p>
          </Card>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-6">함께 만들어가는 성과</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-gray-600">등록된 나무</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
              <div className="text-gray-600">참여 시민</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">나무 종류</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import type { Tree } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Ruler, TreePine } from "lucide-react";

interface TreeCardProps {
  tree: Tree;
  onClick?: () => void;
}

export default function TreeCard({ tree, onClick }: TreeCardProps) {
  const conditionColor = {
    excellent: "bg-green-100 text-green-800",
    fair: "bg-yellow-100 text-yellow-800",
    poor: "bg-red-100 text-red-800"
  };

  const conditionText = {
    excellent: "우수",
    fair: "보통",
    poor: "나쁨"
  };

  const conditionEmoji = {
    excellent: "😊",
    fair: "😐", 
    poor: "☹️"
  };

  return (
    <Card 
      className="overflow-hidden hover:elevation-2 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TreePine className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-gray-800">{tree.species}</h3>
              <p className="text-sm text-gray-600">
                {tree.latitude.toFixed(4)}°N, {tree.longitude.toFixed(4)}°W
              </p>
            </div>
          </div>
          <Badge className={conditionColor[tree.condition as keyof typeof conditionColor]}>
            {conditionText[tree.condition as keyof typeof conditionText]} {conditionEmoji[tree.condition as keyof typeof conditionEmoji]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          {tree.diameter && (
            <div className="flex items-center space-x-2">
              <Ruler className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">직경:</span>
              <span className="font-medium">{tree.diameter}"</span>
            </div>
          )}
          {tree.height && (
            <div className="flex items-center space-x-2">
              <TreePine className="h-4 w-4 text-gray-500" />
              <span className="text-gray-500">높이:</span>
              <span className="font-medium capitalize">{tree.height}</span>
            </div>
          )}
        </div>

        {tree.notes && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tree.notes}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CalendarDays className="h-3 w-3" />
            <span>{new Date(tree.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{tree.contributor}님이 등록</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

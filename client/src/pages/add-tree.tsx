import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MapPin, Camera, Crosshair, TreePine, Building, Hand, Ruler, Info } from "lucide-react";
import { insertTreeSchema, type InsertTree } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect as useEffectAuth } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AddTreePage() {
  const [, setLocation] = useLocation();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [infoDialogContent, setInfoDialogContent] = useState({ title: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  // useEffectAuth(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     toast({
  //       title: "인증 필요",
  //       description: "로그인 후 이용 가능합니다.",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //   }
  // }, [isAuthenticated, isLoading]);

  // Get tree species from API
  const { data: treeSpecies = [] } = useQuery({
    queryKey: ["/api/tree-species"],
    // enabled: isAuthenticated,
  });

  const form = useForm<InsertTree>({
    resolver: zodResolver(insertTreeSchema),
    defaultValues: {
      species: "",
      condition: "excellent",
      latitude: 0,
      longitude: 0,
      diameter: 0,
      height: 0,
      notes: "",
      photoUrl: "",
      status: "pending",
      branchCutting: false,
      groundProtection: false,
      treeDamage: false,
      heightMeasurementMethod: "building",
      circumferenceMeasurementMethod: "hand",
    },
  });

  const createTreeMutation = useMutation({
    mutationFn: async (data: InsertTree) => {
      const formData = new FormData();
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          formData.append(key, (data as any)[key]);
        }
      }
      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }

      const response = await fetch("/api/trees", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create tree");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trees/stats"] });
      toast({
        title: "나무 등록 완료!",
        description: "나무가 성공적으로 등록되었습니다. 검토 후 승인됩니다.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: error.message || "나무 등록에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          form.setValue("latitude", location.lat);
          form.setValue("longitude", location.lng);
          toast({
            title: "위치 정보 획득 완료",
            description: "현재 위치가 설정되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "위치 정보 오류",
            description: "위치 정보를 가져올 수 없습니다. 수동으로 입력해주세요.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInfoClick = (title: string, description: string) => {
    setInfoDialogContent({ title, description });
    setIsInfoDialogOpen(true);
  };

  const onSubmit = (data: InsertTree) => {
    if (!currentLocation) {
      toast({
        title: "위치 정보 필요",
        description: "나무의 위치를 설정해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // Add contributor ID from authenticated user
    const submissionData = {
      ...data,
      contributorId: user?.id || "temp_user", // Use temp_user if not authenticated
      latitude: currentLocation.lat,
      longitude: currentLocation.lng,
    };
    
    createTreeMutation.mutate(submissionData);
  };

  // if (isLoading) {
  //   return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">나무 등록하기</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  위치 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  type="button" 
                  onClick={getCurrentLocation}
                  className="w-full"
                  variant="outline"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  현재 위치 가져오기
                </Button>
                
                {currentLocation && (
                  <div className="text-sm text-gray-600">
                    위도: {currentLocation.lat.toFixed(6)}, 경도: {currentLocation.lng.toFixed(6)}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>위도</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>경도</FormLabel>
                        <FormControl>
                          <Input type="number" step="any" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tree Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5" />
                  나무 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>나무 종류</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInfoClick(
                            "나무 종류 정보",
                            "등록하려는 나무의 종류를 선택해주세요. 정확한 나무 종류를 알면 관리에 도움이 됩니다."
                          )}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="나무 종류를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="은행나무">은행나무</SelectItem>
                            <SelectItem value="단풍나무">단풍나무</SelectItem>
                            <SelectItem value="소나무">소나무</SelectItem>
                            <SelectItem value="중국단풍">중국단풍</SelectItem>
                            <SelectItem value="배롱나무">배롱나무</SelectItem>
                            <SelectItem value="무궁화">무궁화</SelectItem>
                            <SelectItem value="이팝나무">이팝나무</SelectItem>
                            <SelectItem value="메타세콰이어">메타세콰이어</SelectItem>
                            <SelectItem value="백합나무">백합나무</SelectItem>
                            <SelectItem value="느티나무">느티나무</SelectItem>
                            <SelectItem value="벚나무">벚나무</SelectItem>
                            <SelectItem value="플라타너스">플라타너스</SelectItem>
                          </SelectContent>
                        </FormControl>
                        <SelectContent>
                          {treeSpecies.map((species: any) => (
                            <SelectItem key={species.name} value={species.name}>
                              {species.icon} {species.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 1. 상태 평가 테이블 */}
                <div className="space-y-4">
                  <FormLabel className="text-base">세부 상태 평가</FormLabel>
                  {["나뭇잎 무성도", "나뭇잎 상태", "가지 상태", "줄기 상태"].map((item, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={`detailedCondition.${i}`} // ex: detailedCondition.0, .1, ...
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-4">
                            <span className="w-32">{item}</span>
                            <div className="flex gap-4">
                              {["상", "중", "하"].map((label, idx) => (
                                <label key={idx} className="flex items-center space-x-1">
                                  <input
                                    type="radio"
                                    value={label}
                                    checked={field.value === label}
                                    onChange={field.onChange}
                                    className="accent-green-600"
                                  />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              
                {/* 2. 체크리스트 */}
                <div className="mt-6 space-y-2">
                  <FormLabel className="text-base">체크리스트</FormLabel>
                  {[
                    "가로수에 인접한 전깃줄이 있는가",
                    "뿌리가 보도를 밀어올리고 있는가",
                    "보호덮개가 있는가",
                  ].map((label, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={`checklist.${i}`} // ex: checklist.0, .1, ...
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="accent-green-600"
                          />
                          <span>{label}</span>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
               
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  나무 측정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Height Measurement */}
                <FormField
                  control={form.control}
                  name="heightMeasurementMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>높이 측정 방법</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="building" id="building" />
                            <Label htmlFor="building" className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              건물 층수 비교
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="manual" />
                            <Label htmlFor="manual" className="flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              직접 측정
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("heightMeasurementMethod") === "building" 
                          ? "높이 (건물 층수 × 3m)" 
                          : "높이 (미터)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={form.watch("heightMeasurementMethod") === "building" 
                            ? "예: 2층 = 6m" 
                            : "예: 8.5"}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Circumference Measurement */}
                <FormField
                  control={form.control}
                  name="circumferenceMeasurementMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>둘레 측정 방법</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hand" id="hand" />
                            <Label htmlFor="hand" className="flex items-center gap-2">
                              <Hand className="h-4 w-4" />
                              손뼘으로 측정
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tape" id="tape" />
                            <Label htmlFor="tape" className="flex items-center gap-2">
                              <Ruler className="h-4 w-4" />
                              줄자로 측정
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {form.watch("circumferenceMeasurementMethod") === "hand" 
                          ? "둘레 (손뼘 개수 × 20cm)" 
                          : "둘레 (센티미터)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={form.watch("circumferenceMeasurementMethod") === "hand" 
                            ? "예: 5손뼘 = 100cm" 
                            : "예: 95.5"}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Condition Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>나무 상태 점검</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="branchCutting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>가지 잘림 흔적이 있음</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInfoClick(
                            "가지 잘림 흔적 정보",
                            "나무의 가지가 과도하게 잘려나간 흔적이 있는지 확인해주세요. 이는 나무의 건강에 영향을 줄 수 있습니다."
                          )}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groundProtection"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>뿌리 보호덮개가 있음</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInfoClick(
                            "뿌리 보호덮개 정보",
                            "나무 주변에 뿌리 보호덮개(멀칭)가 과도하게 쌓여있거나 부적절하게 사용되고 있는지 확인해주세요. 이는 뿌리 호흡을 방해할 수 있습니다."
                          )}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="treeDamage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>나무에 손상이 있음</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleInfoClick(
                            "나무 손상 정보",
                            "나무 줄기나 가지에 물리적인 손상(상처, 균열 등)이 있는지 확인해주세요. 이는 병충해의 원인이 될 수 있습니다."
                          )}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  사진 첨부
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    capture="environment"
                  />
                  {photoPreview && (
                    <div className="mt-4">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full max-w-sm mx-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>추가 메모</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="나무에 대한 추가 정보나 특이사항을 입력하세요..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createTreeMutation.isPending}
            >
              {createTreeMutation.isPending ? "등록 중..." : "나무 등록하기"}
            </Button>
          </form>
        </Form>
      </div>

      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoDialogContent.title}</DialogTitle>
            <DialogDescription>{infoDialogContent.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}




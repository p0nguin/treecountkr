import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LogoutPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    localStorage.removeItem("token");
    setLocation("/login");
  }, []);

  return <div className="p-8">로그아웃 중...</div>;
}

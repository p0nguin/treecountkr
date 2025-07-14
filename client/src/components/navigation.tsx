import { Link, useLocation } from "wouter";
import { Network, Map, Plus, List, BarChart3, Menu, Home, TreePine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = isAuthenticated ? [
    { path: "/", label: "홈", icon: Home },
    { path: "/map", label: "지도", icon: Map },
    { path: "/data", label: "나무 데이터", icon: List },
    { path: "/stats", label: "통계", icon: BarChart3 },
  ] : [];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-primary text-white shadow-lg elevation-2 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <TreePine className="h-6 w-6 text-secondary" />
              <h1 className="text-xl md:text-2xl font-medium">나무세기</h1>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`px-4 py-2 ${
                        isActive(item.path)
                          ? "bg-primary-foreground text-primary"
                          : "text-white hover:bg-primary/80"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="text-white hover:bg-primary/80"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  로그아웃
                </Button>
              </nav>
            )}

            {!isAuthenticated && (
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/api/login'}
              >
                로그인
              </Button>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link key={item.path} href={item.path} onClick={() => setOpen(false)}>
                        <Button
                          variant={isActive(item.path) ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                    <Link href="/add" onClick={() => setOpen(false)}>
                      <Button className="w-full justify-start bg-accent hover:bg-accent/90">
                        <Plus className="h-4 w-4 mr-2" />
                        나무 추가
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setOpen(false);
                        window.location.href = '/api/logout';
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t elevation-2 z-40">
          <div className="flex justify-around py-2">
            <Link href="/">
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  isActive("/") ? "text-primary" : "text-gray-600"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">홈</span>
              </Button>
            </Link>
            
            <Link href="/map">
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  isActive("/map") ? "text-primary" : "text-gray-600"
                }`}
              >
                <Map className="h-5 w-5" />
                <span className="text-xs mt-1">지도</span>
              </Button>
            </Link>
            
            <Link href="/add">
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  isActive("/add") ? "text-primary" : "text-gray-600"
                }`}
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs mt-1">나무 추가</span>
              </Button>
            </Link>
            
            <Link href="/data">
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  isActive("/data") ? "text-primary" : "text-gray-600"
                }`}
              >
                <List className="h-5 w-5" />
                <span className="text-xs mt-1">데이터</span>
              </Button>
            </Link>
            
            <Link href="/stats">
              <Button
                variant="ghost"
                className={`flex flex-col items-center py-2 px-4 h-auto ${
                  isActive("/stats") ? "text-primary" : "text-gray-600"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs mt-1">통계</span>
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}

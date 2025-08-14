"use client";

import { useState, useEffect } from "react";
import {
  Home,
  MessageSquare,
  ShoppingBag,
  Search,
  User,
  Map,
  Settings,
  GraduationCap,
  LogOut,
  Shield,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import supabase from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/posts", icon: Users, label: "Campus Feed" },
  { href: "/communities", icon: Building2, label: "Communities" },
  { href: "/lost-found", icon: Search, label: "Lost & Found" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/campus-map", icon: Map, label: "Campus Map" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  async function getUserProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (data) {
        setUser(data);
      }
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    getUserProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
      return;
    }

    router.push("/auth/login");
  };

  if (!user) return null;

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">TekPulse</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user.is_admin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                pathname === "/admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Shield className="h-5 w-5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar>
            <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.student_id}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}

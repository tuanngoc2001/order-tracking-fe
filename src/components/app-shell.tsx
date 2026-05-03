"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { adminNavItems, userNavItems } from "./nav-items";
import {
  Bell,
  Menu,
  PackageCheck,
  LogOut,
  ChevronDown,
  House,
  BarChart2,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Globe,
} from "lucide-react";
import { clearAuthSession, getAuthSession } from "@/lib/auth-client";
import { ROUTE_TRANSITION_SENTINEL, useAppAction } from "@/components/app-action-provider";
import { UserCoinBalanceLabel, WalletWithdrawDialog } from "@/components/wallet-withdraw-dialog";

type AvatarItem = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
};

const PLACEHOLDER_IMAGES: AvatarItem[] = [
  {
    id: "avatar-1",
    imageUrl: "https://i.pravatar.cc/100?img=12",
    description: "User avatar",
    imageHint: "user avatar",
  },
  {
    id: "avatar-admin",
    imageUrl: "https://i.pravatar.cc/100?img=15",
    description: "Admin avatar",
    imageHint: "admin avatar",
  },
];

const mockNotifications = [
  {
    id: 1,
    title: "Đơn hàng mới",
    description: "Có 3 đơn hàng vừa được tạo trong 10 phút qua.",
  },
  {
    id: 2,
    title: "Yêu cầu hỗ trợ",
    description: "1 ticket mới từ người dùng cần được phản hồi.",
  },
  {
    id: 3,
    title: "Báo cáo doanh thu",
    description: "Dữ liệu doanh thu hôm nay đã được cập nhật.",
  },
];

function useRouteBlocker() {
  const pathname = usePathname();
  const { beginBlocking } = useAppAction();
  const releaseRef = useRef<(() => void) | null>(null);
  const pendingPathRef = useRef<string | null>(null);

  const startRouteBlock = (href?: string) => {
    if (!href || href === pathname) return;
    releaseRef.current?.();
    pendingPathRef.current = href;
    releaseRef.current = beginBlocking(ROUTE_TRANSITION_SENTINEL);
  };

  useEffect(() => {
    if (pendingPathRef.current !== pathname) return;
    releaseRef.current?.();
    releaseRef.current = null;
    pendingPathRef.current = null;
  }, [pathname]);

  return startRouteBlock;
}

export function AppLogo() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <Link
      href={isAdmin ? "/admin/dashboard" : "/user/home"}
      className="flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50">
        <PackageCheck className="h-5 w-5 text-sky-500" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight text-sky-600 md:text-lg">
          QUANLYVANDON
        </span>
        <span className="hidden text-[11px] text-slate-400 md:block">
          Hệ thống quản lý vận đơn
        </span>
      </div>
    </Link>
  );
}

export function AppNavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const { setOpenMobile, isMobile } = useSidebar();
  const startRouteBlock = useRouteBlocker();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "MMO Accounts": true,
  });

  const handleLinkClick = (href?: string) => {
    startRouteBlock(href);
    if (isMobile) setOpenMobile(false);
  };

  const isChildActive = (children?: { href: string; label: string }[]) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const prefetchTargets = useMemo(
    () =>
      navItems.flatMap((item) =>
        item.children?.length
          ? item.children.map((child) => child.href)
          : item.href
            ? [item.href]
            : []
      ),
    [navItems]
  );

  useEffect(() => {
    prefetchTargets.forEach((href) => {
      router.prefetch(href);
    });
  }, [prefetchTargets, router]);

  return (
    <SidebarMenu className="space-y-1">
      {navItems.map((item) => {
        const activeParent = item.href
          ? pathname === item.href
          : isChildActive(item.children);

        if (item.children?.length) {
          const isOpen = openGroups[item.label] ?? false;

          return (
            <SidebarMenuItem key={item.label}>
              <button
                type="button"
                onClick={() => toggleGroup(item.label)}
                className={`flex h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-medium transition ${
                  activeParent
                    ? "bg-sky-500 text-white"
                    : "text-slate-700 hover:bg-sky-50 hover:text-sky-600"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-3">
                  {item.children.map((child) => {
                    const active = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => handleLinkClick(child.href)}
                        className={`flex h-9 items-center rounded-lg px-3 text-sm transition ${
                          active
                            ? "bg-sky-50 font-semibold text-sky-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
              className="h-11 rounded-xl data-[active=true]:bg-sky-500 data-[active=true]:text-white hover:bg-sky-50 hover:text-sky-600"
            >
              <Link href={item.href!} onClick={() => handleLinkClick(item.href!)}>
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function SidebarLogoutButton() {
  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
    >
      <LogOut className="h-4 w-4" />
      <span>Đăng xuất</span>
    </button>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const isUser = pathname.startsWith("/user");
  const isAdmin = pathname.startsWith("/admin");
  const { toggleSidebar } = useSidebar();
  const session = getAuthSession();

  const getAvatar = (id: string) =>
    PLACEHOLDER_IMAGES.find((img) => img.id === id);

  const userAvatarId = isUser ? "avatar-1" : "avatar-admin";
  const userName = session?.name ?? (isUser ? "User" : "Admin");
  const userRole = session?.role === "admin" ? "Admin" : "User";
  const avatar = getAvatar(userAvatarId);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="rounded-xl border-slate-200 bg-white md:rounded-lg"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <div className="relative max-w-xl">
          <input
            className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 md:h-11 md:rounded-xl"
            placeholder={
              isAdmin
                ? "Tìm kiếm sản phẩm..."
                : "Tìm kiếm đơn hàng, mã vận đơn..."
            }
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative hidden rounded-full border-slate-200 bg-white hover:bg-sky-50 md:inline-flex"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-xl p-2">
              <DropdownMenuLabel className="px-2 py-1 text-sm font-semibold text-slate-900">
                Thông báo
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {mockNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex cursor-pointer flex-col items-start rounded-lg px-3 py-3 focus:bg-sky-50"
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {notification.title}
                  </span>
                  <span className="mt-1 text-xs leading-5 text-slate-500">
                    {notification.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isUser && <WalletWithdrawDialog />}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 py-1.5 transition hover:bg-slate-50 md:gap-3 md:rounded-xl md:px-2">
              <Avatar className="h-9 w-9 md:h-9 md:w-9">
                {avatar && (
                  <AvatarImage
                    src={avatar.imageUrl}
                    alt={avatar.description}
                    data-ai-hint={avatar.imageHint}
                  />
                )}
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-400">
                  {isUser ? <UserCoinBalanceLabel /> : userRole}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href={isAdmin ? "/admin/settings" : "/user/profile"}>
                Cài đặt tài khoản
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

type MobileNavEntry = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  active?: boolean;
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const isUser = pathname.startsWith("/user");
  const { toggleSidebar } = useSidebar();
  const startRouteBlock = useRouteBlocker();

  const items: MobileNavEntry[] = isUser
    ? [
        { href: "/user/home", label: "Trang chủ", icon: House },
        { href: "/user/orders", label: "Đơn hàng", icon: PackageCheck },
        { href: "/user/stats", label: "Thống kê", icon: BarChart2 },
        { href: "/user/profile", label: "Cài đặt", icon: Settings },
      ]
    : [
        { href: "/admin/dashboard", label: "Trang chủ", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
        { href: "/admin/users", label: "Users", icon: Users },
        {
          label: "Menu",
          icon: Globe,
          action: toggleSidebar,
          active: pathname.startsWith("/admin/mmo") || pathname.startsWith("/admin/export") || pathname.startsWith("/admin/stats"),
        },
      ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-50/90 p-1.5">
        {items.map((item) => {
          const active = item.active ?? (item.href ? pathname === item.href : false);
          const content = (
            <div
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition ${
                active
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-sky-600"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className="block" onClick={() => startRouteBlock(item.href)}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.label} type="button" onClick={item.action} className="block">
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

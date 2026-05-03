import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Globe,
  BarChart2,
  Download,
  FileText,
  Settings,
  House,
  Package,
  HandCoins,
} from "lucide-react";

export type NavChildItem = {
  href: string;
  label: string;
};

export type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: NavChildItem[];
};

export const adminNavItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Trang chủ",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Quản lý đơn hàng",
    icon: ShoppingCart,
  },
  {
    href: "/admin/users",
    label: "Quản lý người dùng",
    icon: Users,
  },
  {
    href: "/admin/withdrawals",
    label: "Yêu cầu rút tiền",
    icon: HandCoins,
  },
  {
    label: "MMO Accounts",
    icon: Globe,
    children: [
      {
        href: "/admin/mmo",
        label: "Danh sách tài khoản",
      },
      {
        href: "/admin/mmo/proxy",
        label: "Proxy",
      },
    ],
  },
  {
    href: "/admin/stats",
    label: "Thống kê",
    icon: BarChart2,
  },
  {
    href: "/admin/export",
    label: "Xuất dữ liệu",
    icon: Download,
  },
  {
    href: "/admin/posts",
    label: "Bài viết",
    icon: FileText,
  },
  {
    href: "/admin/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];

export const userNavItems: NavItem[] = [
  {
    href: "/user/home",
    label: "Trang chủ",
    icon: House,
  },
  {
    href: "/user/orders",
    label: "Đơn hàng",
    icon: Package,
  },
  {
    href: "/user/stats",
    label: "Thống kê",
    icon: BarChart2,
  },
  {
    href: "/user/commission",
    label: "Hoa hồng",
    icon: HandCoins,
  },
  {
    href: "/user/profile",
    label: "Cài đặt",
    icon: Settings,
  },
];

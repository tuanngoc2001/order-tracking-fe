export type OrderStatus = "Đang chờ" | "Thành công" | "Thất bại";

export type Order = {
  id: string;
  trackingCode: string;
  customerName: string;
  phone: string;
  amount: number;
  cost: number;
  profit: number;
  status: OrderStatus;
  createdAt: string;
  proofImageUrl?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AdminDashboardStats = {
  totalRevenue: number;
  revenueChange: number;
  totalProfit: number;
  profitChange: number;
  totalOrders: number;
  ordersChange: number;
};

export type TopUser = {
  id: string;
  name: string;
  orderCount: number;
  profit: number;
  avatarId: string;
};

export type UserForManagement = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  profit: number;
  status: "active" | "locked" | "inactive" | "Active" | "Locked" | "Inactive";
  avatarId: string;
};

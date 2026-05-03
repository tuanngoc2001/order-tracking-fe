import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminDashboardStats } from "@/lib/definitions";
import { DollarSign, Package, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: AdminDashboardStats;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.revenueChange >= 0 ? "+" : ""}
            {stats.revenueChange.toFixed(2)}% so với tháng trước
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lợi Nhuận</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.profitChange >= 0 ? "+" : ""}
            {stats.profitChange.toFixed(2)}% so với tháng trước
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.ordersChange >= 0 ? "+" : ""}
            {stats.ordersChange.toFixed(2)}% so với tháng trước
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

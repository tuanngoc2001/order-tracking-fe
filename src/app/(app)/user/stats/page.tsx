"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MonthlyOrdersChart from "./components/monthly-orders-chart";
import { useAppAction } from "@/components/app-action-provider";
import { getUserStats, type UserStatsResponse } from "@/lib/api-client";

export default function UserStatsPage() {
  const { beginBlocking } = useAppAction();
  const [stats, setStats] = useState<UserStatsResponse | null>(null);

  useEffect(() => {
    const release = beginBlocking("Đang tải thống kê...");
    getUserStats().then(setStats).catch(console.error).finally(release);
  }, [beginBlocking]);

  const chartData = stats
    ? [
        { name: "Hoàn thành", value: stats.completedOrders, color: "#10b981" },
        { name: "Đang vận chuyển", value: stats.shippingOrders, color: "#0ea5e9" },
        { name: "Đang xử lý", value: stats.pendingOrders, color: "#f59e0b" },
        {
          name: "Khác",
          value: Math.max(
            0,
            stats.totalOrders - stats.completedOrders - stats.shippingOrders - stats.pendingOrders
          ),
          color: "#94a3b8",
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Thống kê đơn hàng</h1>
        <p className="text-muted-foreground">Theo dõi tỷ lệ trạng thái đơn hàng của bạn.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Tổng đơn</CardTitle></CardHeader><CardContent>{stats?.totalOrders ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Hoàn thành</CardTitle></CardHeader><CardContent>{stats?.completedOrders ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Đang giao</CardTitle></CardHeader><CardContent>{stats?.shippingOrders ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Đang xử lý</CardTitle></CardHeader><CardContent>{stats?.pendingOrders ?? 0}</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ trạng thái đơn hàng</CardTitle>
          <CardDescription>Biểu đồ hình tròn thể hiện phân bổ đơn hàng theo trạng thái.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyOrdersChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Package, Truck, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppAction } from "@/components/app-action-provider";
import { TaskBoard } from "../components/task-board";
import { getTaskPosts, getUserDashboard, type TaskResponse, type UserDashboardResponse } from "@/lib/api-client";

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 md:mb-4 md:h-11 md:w-11">{icon}</div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 break-words text-xl font-bold text-slate-900 md:text-2xl">{value}</p>
    </div>
  );
}

export default function UserHomePage() {
  const { toast } = useToast();
  const { beginBlocking } = useAppAction();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [dashboard, setDashboard] = useState<UserDashboardResponse | null>(null);

  useEffect(() => {
    const release = beginBlocking("Đang tải trang...");

    Promise.all([getTaskPosts(), getUserDashboard()])
      .then(([taskItems, dashboardData]) => {
        setTasks(taskItems);
        setDashboard(dashboardData);
      })
      .catch(console.error)
      .finally(release);
  }, [beginBlocking]);

  const totalRevenue = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(dashboard?.totalRevenue ?? 0),
    [dashboard]
  );

  const handleCopyAddress = async (address: string, title: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({ title: "Đã sao chép địa chỉ", description: title });
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Trình duyệt chưa cho phép truy cập clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Trang chủ</h1>
        <p className="mt-1 text-sm text-slate-500">Tổng quan vận đơn và nhiệm vụ bạn có thể làm.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard title="Tổng đơn hàng" value={String(dashboard?.totalOrders ?? 0)} icon={<Package className="h-5 w-5" />} />
        <StatCard title="Đang giao" value={String(dashboard?.shippingOrders ?? 0)} icon={<Truck className="h-5 w-5" />} />
        <StatCard title="Doanh thu" value={totalRevenue} icon={<Wallet className="h-5 w-5" />} />
        <StatCard title="Chờ xử lý" value={String(dashboard?.pendingOrders ?? 0)} icon={<Clock3 className="h-5 w-5" />} />
      </div>

      <TaskBoard tasks={tasks} onCopyAddress={handleCopyAddress} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-2xl md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h2>
        <div className="mt-4 space-y-3">
          {(dashboard?.recentActivities ?? []).map((activity, index) => (
            <div key={index} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{activity}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

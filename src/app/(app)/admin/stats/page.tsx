"use client";

import { useEffect, useState } from "react";
import { Activity, Banknote, Package, PieChart as PieChartIcon, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getAdminStats, type AdminStatsResponse } from "@/lib/api-client";
import { useAppAction } from "@/components/app-action-provider";

const revenueChartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "#0ea5e9",
  },
};

const statusChartConfig = {
  value: {
    label: "Số đơn",
    color: "#0ea5e9",
  },
};

const roleChartConfig = {
  value: {
    label: "Số tài khoản",
    color: "#38bdf8",
  },
};

const statusColors = ["#f59e0b", "#6366f1", "#0ea5e9", "#ef4444"];
const roleColors = ["#1d4ed8", "#38bdf8"];

export default function AdminStatsPage() {
  const { beginBlocking } = useAppAction();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);

  useEffect(() => {
    const release = beginBlocking("Đang tải thống kê admin...");
    getAdminStats().then(setStats).finally(release);
  }, [beginBlocking]);

  const cardIcons = [
    <Package className="h-5 w-5" key="orders" />,
    <Banknote className="h-5 w-5" key="revenue" />,
    <Users className="h-5 w-5" key="users" />,
    <Activity className="h-5 w-5" key="processing" />,
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Thống kê admin</h1>
          <p className="mt-1 text-sm text-slate-500">Tất cả biểu đồ và số liệu đang lấy từ API backend.</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
          <PieChartIcon className="h-4 w-4" />
          Real API data
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(stats?.metrics ?? []).map((metric, index) => (
          <div key={metric.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">{cardIcons[index] ?? cardIcons[0]}</div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{metric.title}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="mt-2 text-xs font-medium text-slate-400">{metric.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Doanh thu theo tháng</h2>
            <p className="mt-1 text-sm text-slate-500">Doanh thu hoàn thành theo 12 tháng gần nhất.</p>
          </div>

          <ChartContainer config={revenueChartConfig} className="h-[320px] w-full">
            <BarChart accessibilityLayer data={stats?.monthlyRevenue ?? []} barCategoryGap="24%">
              <CartesianGrid vertical={false} strokeDasharray="4 6" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)}M`} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(Number(value))
                    }
                  />
                }
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[10, 10, 4, 4]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Trạng thái đơn hàng</h2>
            <p className="mt-1 text-sm text-slate-500">Phân bố đơn theo trạng thái hiện tại.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_1fr] xl:grid-cols-1 2xl:grid-cols-[220px_1fr]">
            <ChartContainer config={statusChartConfig} className="mx-auto h-[220px] w-full max-w-[220px]">
              <PieChart>
                <Pie data={stats?.orderStatusBreakdown ?? []} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4} strokeWidth={0}>
                  {(stats?.orderStatusBreakdown ?? []).map((entry, index) => (
                    <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${new Intl.NumberFormat("vi-VN").format(Number(value))} đơn`} hideLabel />} />
              </PieChart>
            </ChartContainer>

            <div className="space-y-3">
              {(stats?.orderStatusBreakdown ?? []).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: statusColors[index % statusColors.length] }} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{new Intl.NumberFormat("vi-VN").format(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Phân bố tài khoản</h2>
            <p className="mt-1 text-sm text-slate-500">Số lượng tài khoản admin và user trong hệ thống.</p>
          </div>

          <ChartContainer config={roleChartConfig} className="h-[280px] w-full">
            <BarChart accessibilityLayer data={stats?.userRoleBreakdown ?? []} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid horizontal={false} strokeDasharray="4 6" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="role" tickLine={false} axisLine={false} width={72} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${new Intl.NumberFormat("vi-VN").format(Number(value))} tài khoản`} hideLabel />} />
              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                {(stats?.userRoleBreakdown ?? []).map((entry, index) => (
                  <Cell key={entry.role} fill={roleColors[index % roleColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Top khách hàng</h2>
            <p className="mt-1 text-sm text-slate-500">Xếp hạng theo doanh thu đơn đã hoàn thành.</p>
          </div>

          <div className="space-y-3">
            {(stats?.topCustomers ?? []).map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-600">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{customer.name}</p>
                    <p className="text-xs text-slate-400">{customer.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-sm font-semibold text-slate-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(customer.totalAmount)}
                  </span>
                  <span className="text-xs text-slate-400">{customer.orderCount} đơn</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type UserStatusStat = {
  name: string;
  value: number;
  color: string;
};

interface MonthlyOrdersChartProps {
  data: UserStatusStat[];
}

export default function MonthlyOrdersChart({ data }: MonthlyOrdersChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={120}
              paddingAngle={4}
              cornerRadius={10}
              stroke="transparent"
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const item = payload[0].payload as UserStatusStat;

                return (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-slate-500">
                      {item.value} đơn hàng
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-slate-900">{total}</div>
            <div className="mt-1 text-sm font-medium text-slate-400">
              tổng đơn
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3">
        {data.map((item) => {
          const percent = total === 0 ? 0 : Math.round((item.value / total) * 100);

          return (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-semibold text-slate-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {item.value}
                </div>
                <div className="text-xs text-slate-400">{percent}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

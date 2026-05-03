"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddOrderForm from "./components/add-order-form";
import OrderList from "./components/order-list";
import type { UserOrder } from "./components/types";
import { useAppAction } from "@/components/app-action-provider";
import { createUserOrder, getUserOrders } from "@/lib/api-client";

const mapOrder = (order: {
  id: number;
  trackingCode: string;
  amount: number;
  status: UserOrder["status"];
  createdAt: string;
  proofImageUrl?: string | null;
}): UserOrder => ({
  id: String(order.id),
  trackingCode: order.trackingCode,
  amount: order.amount,
  status: order.status,
  createdAt: order.createdAt,
  proofImageUrl: order.proofImageUrl ?? undefined,
});

export default function UserOrdersPage() {
  const { beginBlocking } = useAppAction();
  const [orders, setOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    const release = beginBlocking("Đang tải đơn hàng...");
    getUserOrders()
      .then((items) => setOrders(items.map(mapOrder)))
      .catch(console.error)
      .finally(release);
  }, [beginBlocking]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const handleAddOrder = async (trackingCode: string) => {
    const created = await createUserOrder({ trackingCode });
    setOrders((prev) => [mapOrder(created), ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Vận đơn của tôi</h1>
        <p className="text-muted-foreground">Thêm và quản lý các mã vận đơn của bạn.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thêm mã vận đơn</CardTitle>
              <CardDescription>Nhập mã vận đơn mới để theo dõi.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddOrderForm onAddOrder={handleAddOrder} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vận đơn</CardTitle>
              <CardDescription>Các vận đơn bạn đã thêm.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList orders={sortedOrders} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddOrderForm from "./add-order-form";
import OrderList from "./order-list";
import type { UserOrder } from "./types";
import { useToast } from "@/hooks/use-toast";
import { createUserOrder } from "@/lib/api-client";

interface UserOrdersViewProps {
  initialOrders: UserOrder[];
}

export default function UserOrdersView({ initialOrders }: UserOrdersViewProps) {
  const [userOrders, setUserOrders] = useState<UserOrder[]>(initialOrders);
  const { toast } = useToast();

  const handleAddOrder = useCallback(
    async (trackingCode: string) => {
      if (
        userOrders.some(
          (order) =>
            order.trackingCode.toLowerCase() === trackingCode.toLowerCase()
        )
      ) {
        toast({
          title: "Lỗi",
          description: "Mã vận đơn này đã được thêm.",
          variant: "destructive",
        });
        return;
      }

      const created = await createUserOrder({ trackingCode });
      setUserOrders((prevOrders) => [
        {
          id: String(created.id),
          trackingCode: created.trackingCode,
          amount: created.amount,
          status: created.status,
          createdAt: created.createdAt,
        },
        ...prevOrders,
      ]);
    },
    [userOrders, toast]
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Thêm mã vận đơn</CardTitle>
            <CardDescription>Nhập mã vận đơn mới để theo dõi.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <AddOrderForm onAddOrder={handleAddOrder} />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Danh sách vận đơn</CardTitle>
            <CardDescription>Các vận đơn bạn đã thêm.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <OrderList orders={userOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

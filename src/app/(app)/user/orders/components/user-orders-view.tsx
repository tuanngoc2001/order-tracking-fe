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

interface UserOrdersViewProps {
  initialOrders: UserOrder[];
}

export default function UserOrdersView({ initialOrders }: UserOrdersViewProps) {
  const [userOrders, setUserOrders] = useState<UserOrder[]>(initialOrders);
  const { toast } = useToast();

  const handleAddOrder = useCallback(
    (trackingCode: string) => {
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

      const currentDate = new Date().toISOString().slice(0, 10);
      // Create a new mock order object to simulate adding
      const newOrder: UserOrder = {
        id: String(Date.now()),
        trackingCode: trackingCode,
        amount: Math.floor(Math.random() * 2000000) + 100000,
        status: "pending",
        createdAt: currentDate,
      };

      setUserOrders((prevOrders) => [newOrder, ...prevOrders]);
    },
    [userOrders, toast]
  );

  return (
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
            <OrderList orders={userOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

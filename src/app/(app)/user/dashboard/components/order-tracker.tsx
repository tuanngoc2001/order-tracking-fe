"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trackUserOrder, type UserOrderDetail } from "@/lib/api-client";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OrderTracker() {
  const searchParams = useSearchParams();
  const urlTrackingCode = searchParams.get("trackingCode");
  const [trackingCode, setTrackingCode] = useState(urlTrackingCode || "");
  const [order, setOrder] = useState<UserOrderDetail | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(() => {
    if (!trackingCode) return;
    setIsLoading(true);
    trackUserOrder(trackingCode)
      .then((foundOrder) => setOrder(foundOrder))
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [trackingCode]);

  useEffect(() => {
    if (urlTrackingCode) {
      handleSearch();
    }
  }, [urlTrackingCode, handleSearch]);

  const getStatusVariant = (status: UserOrderDetail["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: UserOrderDetail["status"]) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang vận chuyển";
      case "completed":
        return "Thành công";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhập mã vận đơn của bạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-md items-center space-x-2">
          <Input
            type="text"
            placeholder="VD: DH001"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Kiểm tra</span>
          </Button>
        </div>

        {order === null && (
          <div className="mt-6 text-center text-muted-foreground">
            <p>Không tìm thấy đơn hàng với mã vận đơn này.</p>
          </div>
        )}

        {order && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chi tiết đơn hàng</CardTitle>
                  <p className="text-sm text-muted-foreground">{order.trackingCode}</p>
                </div>
                <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Lịch sử cập nhật</h4>
                <ul className="space-y-2 text-sm">
                  {order.history.map((h, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-muted-foreground w-28 shrink-0">
                        {new Date(h.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span>{h.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

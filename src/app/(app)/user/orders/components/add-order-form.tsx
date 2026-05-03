"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";

interface AddOrderFormProps {
  onAddOrder: (trackingCode: string) => Promise<void> | void;
}

export default function AddOrderForm({ onAddOrder }: AddOrderFormProps) {
  const [trackingCode, setTrackingCode] = useState("");
  const { isBlocking, runAction } = useAppAction();
  const { toast } = useToast();

  const handleAddOrder = useCallback(async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã vận đơn.",
        variant: "destructive",
      });
      return;
    }

    await runAction(async () => {
      await onAddOrder(trackingCode.trim());
      setTrackingCode("");
    }, {
      loadingMessage: "Đang thêm mã vận đơn...",
      successTitle: "Thêm mã vận đơn thành công",
      successDescription: `${trackingCode.trim()} đã được thêm vào danh sách.`,
    });
  }, [trackingCode, onAddOrder, toast, runAction]);

  return (
    <div className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="VD: VN123456789"
        value={trackingCode}
        onChange={(e) => setTrackingCode(e.target.value)}
        disabled={isBlocking}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isBlocking) {
            handleAddOrder();
          }
        }}
      />
      <Button onClick={handleAddOrder} disabled={isBlocking}>
        {isBlocking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
        <span className="ml-2 hidden sm:inline">Thêm</span>
      </Button>
    </div>
  );
}

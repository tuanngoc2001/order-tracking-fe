"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Clipboard, Loader2 } from "lucide-react";
import { adminAIShippingStatusUpdate } from "@/ai/flows/admin-ai-shipping-status-update";
import { useToast } from "@/hooks/use-toast";

export default function AiStatusUpdater() {
  const [shippingStatus, setShippingStatus] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [generatedMessage, setGeneratedMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!shippingStatus) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn trạng thái vận đơn.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setGeneratedMessage("");
    try {
      const result = await adminAIShippingStatusUpdate({
        shippingStatus,
        trackingCode,
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error("AI status update failed:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo thông báo. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [shippingStatus, trackingCode, toast]);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Thành công",
      description: "Đã sao chép tin nhắn vào clipboard.",
    });
  }, [generatedMessage, toast]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="shipping-status">Trạng thái vận đơn</Label>
        <Select onValueChange={setShippingStatus} value={shippingStatus}>
          <SelectTrigger id="shipping-status">
            <SelectValue placeholder="Chọn trạng thái..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Đang chờ">Đang chờ</SelectItem>
            <SelectItem value="Thành công">Thành công</SelectItem>
            <SelectItem value="Thất bại">Thất bại</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tracking-code">Mã vận đơn (tùy chọn)</Label>
        <Input
          id="tracking-code"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="VD: VN123456789"
        />
      </div>
      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Bot className="mr-2 h-4 w-4" />
        )}
        Tạo thông báo
      </Button>

      {generatedMessage && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="generated-message">Tin nhắn được tạo</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Clipboard className="h-4 w-4 mr-2"/>
                Sao chép
            </Button>
          </div>
          <Textarea
            id="generated-message"
            readOnly
            value={generatedMessage}
            rows={5}
            className="bg-muted"
          />
        </div>
      )}
    </div>
  );
}

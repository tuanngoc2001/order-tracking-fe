"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/lib/definitions";

interface ExportFormProps {
    orders: Order[];
}

export default function ExportForm({ orders }: ExportFormProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set<string>();
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      uniqueMonths.add(`${year}-${month}`);
    });

    return Array.from(uniqueMonths)
      .map(monthStr => {
        const [year, month] = monthStr.split('-');
        return {
          value: monthStr,
          label: `Tháng ${parseInt(month, 10)}/${year}`,
        };
      })
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [orders]);

  const handleExport = useCallback(async () => {
    if (!selectedMonth) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một tháng để xuất dữ liệu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const XLSX = await import("xlsx");
      const [year, month] = selectedMonth.split("-");

      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === parseInt(year) && (orderDate.getMonth() + 1) === parseInt(month);
      });

      if (filteredOrders.length === 0) {
          toast({
              title: "Không có dữ liệu",
              description: `Không có đơn hàng nào trong tháng ${month}/${year}.`,
          });
          setIsLoading(false);
          return;
      }

      const dataToExport = filteredOrders.map(order => ({
        'Tên User': order.user.name,
        'Mã Vận Đơn': order.trackingCode,
        'Giá gốc': order.cost,
        'Doanh Thu': order.amount,
        'Lợi Nhuận': order.profit,
        'Trạng thái': order.status,
        'Ngày Tạo': order.createdAt,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng");
      
      worksheet["!cols"] = [
          { wch: 20 }, // Tên User
          { wch: 15 }, // Mã Vận Đơn
          { wch: 15 }, // Giá gốc
          { wch: 15 }, // Doanh Thu
          { wch: 15 }, // Lợi Nhuận
          { wch: 12 }, // Trạng thái
          { wch: 12 }, // Ngày Tạo
      ];

      XLSX.writeFile(workbook, `Bao_cao_don_hang_${month}_${year}.xlsx`);

      toast({
          title: "Thành công",
          description: "Đã xuất dữ liệu thành công."
      })
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Lỗi",
        description: "Xuất dữ liệu thất bại. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, toast, orders]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Chọn tháng</CardTitle>
        <CardDescription>
          Chọn tháng bạn muốn xuất dữ liệu đơn hàng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedMonth} value={selectedMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn tháng..." />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleExport} disabled={isLoading || !selectedMonth} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          Xuất file Excel
        </Button>
      </CardContent>
    </Card>
  );
}

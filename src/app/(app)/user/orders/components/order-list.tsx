"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { UserOrder, UserOrderStatus } from "./types";

interface OrderListProps {
  orders: UserOrder[];
}

const ITEMS_PER_PAGE = 10;

const statusMeta: Record<
  UserOrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Đang chờ", variant: "outline" },
  processing: { label: "Đang xử lý", variant: "secondary" },
  shipping: { label: "Đang vận chuyển", variant: "secondary" },
  completed: { label: "Thành công", variant: "default" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
};

export default function OrderList({ orders }: OrderListProps) {
  const [imageOrder, setImageOrder] = useState<UserOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, orders]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  return (
    <>
      <div className="space-y-3 md:hidden">
        {paginatedOrders.map((order) => {
          const meta = statusMeta[order.status];

          return (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Mã vận đơn</p>
                  <p className="mt-1 break-all text-sm font-bold text-slate-900">{order.trackingCode}</p>
                </div>
                <Badge variant={meta.variant} className="shrink-0">{meta.label}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Số tiền</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatCurrency(order.amount)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Ngày tạo</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {order.status === "completed" && order.proofImageUrl ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setImageOrder(order)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem ảnh
                </Button>
              ) : null}
            </div>
          );
        })}

        {paginatedOrders.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Chưa có mã vận đơn nào.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã vận đơn</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-center">Ảnh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => {
              const meta = statusMeta[order.status];

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.trackingCode}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    {order.status === "completed" && order.proofImageUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setImageOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Xem ảnh</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  Chưa có mã vận đơn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      size="icon"
                      isActive={currentPage === page}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={cn(
                    currentPage === totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={!!imageOrder} onOpenChange={(isOpen) => !isOpen && setImageOrder(null)}>
        <DialogContent>
          {imageOrder?.proofImageUrl && (
            <>
              <DialogHeader>
                <DialogTitle>Ảnh chuyển khoản</DialogTitle>
                <DialogDescription>
                  Ảnh chứng minh thanh toán cho đơn hàng {imageOrder.trackingCode}.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Image
                  src={imageOrder.proofImageUrl}
                  alt="Proof of payment"
                  width={600}
                  height={400}
                  className="rounded-md object-cover"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

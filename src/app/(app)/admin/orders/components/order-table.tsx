"use client";

import Image from "next/image";
import { useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/lib/definitions";
import { MoreHorizontal, Upload } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface OrderTableProps {
  orders: Order[];
}

const ITEMS_PER_PAGE = 10;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusVariant = (status: Order["status"]) => {
  switch (status) {
    case "Thành công":
      return "default";
    case "Đang chờ":
      return "outline";
    case "Thất bại":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function OrderTable({ orders: initialOrders }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [viewImageOrder, setViewImageOrder] = useState<Order | null>(null);
  const [uploadImageOrder, setUploadImageOrder] = useState<Order | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, orders]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const proofImage = PlaceHolderImages.find(
    (img) => img.id === "proof-payment-1"
  );

  const handleStatusUpdate = useCallback((orderTrackingCode: string, newStatus: OrderStatus) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.trackingCode === orderTrackingCode ? { ...order, status: newStatus } : order
      )
    );
    // In a real app, you would make an API call here to update the order status.
    toast({
      title: "Thành công",
      description: `Trạng thái của đơn hàng ${orderTrackingCode} đã được cập nhật thành ${newStatus}.`,
    });
  }, [toast]);
  
  const handleUpload = useCallback(() => {
    if (!selectedFile || !uploadImageOrder) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một file ảnh để tải lên.",
        variant: "destructive",
      });
      return;
    }
    // In a real app, you would upload the file to a storage service.
    // Here, we'll create a temporary URL to display the image.
    const imageUrl = URL.createObjectURL(selectedFile);
    setOrders(currentOrders =>
      currentOrders.map(o =>
        o.trackingCode === uploadImageOrder.trackingCode ? { ...o, proofImageUrl: imageUrl } : o
      )
    );
    
    toast({
      title: "Thành công",
      description: `Đã tải lên ảnh cho đơn hàng ${uploadImageOrder?.trackingCode}.`,
    });
    setUploadImageOrder(null);
    setSelectedFile(null);
  }, [selectedFile, uploadImageOrder, toast]);

  const getOrderImageUrl = useCallback((order: Order | null): string | null => {
    if (!order) return null;
    return order.proofImageUrl || null;
  }, []);

  return (
    <>
      <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Mã Vận Đơn</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Giá gốc</TableHead>
                <TableHead className="text-right">Lãi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>
                <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedOrders.map((order) => (
                <TableRow
                key={order.trackingCode}
                onClick={() => {
                    if (order.proofImageUrl) {
                    setViewImageOrder(order);
                    }
                }}
                className={cn(order.proofImageUrl && "cursor-pointer")}
                >
                <TableCell className="font-medium">{order.trackingCode}</TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell className="text-right">
                    {formatCurrency(order.cost)}
                </TableCell>
                <TableCell className="text-right">
                    {formatCurrency(order.profit)}
                </TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Badge variant={getStatusVariant(order.status)} className="cursor-pointer">
                        {order.status}
                        </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Đổi trạng thái</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                        disabled={order.status === "Đang chờ"}
                        onSelect={() => handleStatusUpdate(order.trackingCode, "Đang chờ")}>
                        Đang chờ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        disabled={order.status === "Thành công"}
                        onSelect={() => handleStatusUpdate(order.trackingCode, "Thành công")}>
                        Thành công
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        disabled={order.status === "Thất bại"}
                        onSelect={() => handleStatusUpdate(order.trackingCode, "Thất bại")}>
                        Thất bại
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                <TableCell>{order.createdAt}</TableCell>
                <TableCell>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setUploadImageOrder(order)}>
                        Tải lên ảnh chuyển khoản
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                        Xóa đơn
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
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
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1);
                            }}
                            className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                size="icon"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage + 1);
                            }}
                            className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}

      <Dialog open={!!viewImageOrder} onOpenChange={(isOpen) => !isOpen && setViewImageOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ảnh chuyển khoản</DialogTitle>
            <DialogDescription>
              Ảnh chứng minh thanh toán cho đơn hàng {viewImageOrder?.trackingCode}.
            </DialogDescription>
          </DialogHeader>
          {getOrderImageUrl(viewImageOrder) ? (
            <div className="mt-4">
              <Image
                src={getOrderImageUrl(viewImageOrder)!}
                alt="Proof of payment"
                width={600}
                height={400}
                className="rounded-md object-cover"
                data-ai-hint={proofImage?.imageHint || 'receipt screenshot'}
              />
            </div>
          ) : (
             <div className="mt-4 flex items-center justify-center h-48 bg-muted rounded-md">
                <p className="text-muted-foreground">Không có ảnh cho đơn hàng này.</p>
             </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!uploadImageOrder} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setUploadImageOrder(null);
          setSelectedFile(null);
        }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Tải lên ảnh chuyển khoản</DialogTitle>
                <DialogDescription>
                Tải lên ảnh chứng minh thanh toán cho đơn hàng {uploadImageOrder?.trackingCode}.
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid w-full items-center gap-2">
                <Label htmlFor="picture">Ảnh</Label>
                <Input id="picture" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                <Button className="mt-2 w-full" onClick={handleUpload} disabled={!selectedFile}>
                    <Upload className="mr-2 h-4 w-4" />
                    Tải lên
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

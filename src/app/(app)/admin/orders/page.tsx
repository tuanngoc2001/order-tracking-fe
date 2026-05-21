"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import DatePicker from "@/components/ui/date-picker";
import { useAppAction } from "@/components/app-action-provider";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminRecentOrderResponse,
} from "@/lib/api-client";

type OrderStatus =
  | "processing"
  | "unpaid"
  | "shipping"
  | "completed"
  | "cancelled";

type Order = {
  id: number;
  code: string;
  customer: string;
  total: string;
  status: OrderStatus;
  createdAt: string;
  transferImage?: string;
};

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")} đ`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapApiOrder(order: AdminRecentOrderResponse): Order {
  return {
    id: order.id,
    code: order.trackingCode,
    customer: order.customerName,
    total: formatCurrency(order.totalAmount),
    status: order.status === "pending" ? "unpaid" : (order.status as OrderStatus),
    createdAt: order.createdAt,
    transferImage: order.proofImageUrl ?? undefined,
  };
}

const statusOptions: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "processing", label: "Đang xử lý" },
  { value: "unpaid", label: "Chờ thanh toán" },
  { value: "shipping", label: "Đang vận chuyển" },
  { value: "completed", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

const editableStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: "processing", label: "Đang xử lý" },
  { value: "unpaid", label: "Chờ thanh toán" },
  { value: "shipping", label: "Đang vận chuyển" },
  { value: "completed", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã hủy" },
];

function TransferImageModal({
  order,
  previewImage,
  onClose,
}: {
  order: Order | null;
  previewImage: string;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Ảnh chuyển khoản
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Đơn hàng {order.code} - {order.customer}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {previewImage ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={previewImage}
                alt="Ảnh chuyển khoản"
                className="max-h-[460px] w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center">
              <p className="font-semibold text-slate-700">Chưa có ảnh chuyển khoản</p>
              <p className="mt-1 text-sm text-slate-400">Backend chưa trả về ảnh cho đơn hàng này.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { isBlocking, runAction } = useAppAction();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [editedStatuses, setEditedStatuses] = useState<
    Record<number, OrderStatus>
  >({});

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  const pageSize = 6;

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAdminOrders()
      .then((items) => {
        if (mounted) setOrders(items.map(mapApiOrder));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.code.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());

      const currentStatus = editedStatuses[order.id] ?? order.status;
      const matchStatus = status === "all" || currentStatus === status;

      const orderDate = new Date(order.createdAt);
      const matchFrom = !fromDate || orderDate >= fromDate;
      const matchTo = !toDate || orderDate <= toDate;

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [orders, search, status, fromDate, toDate, editedStatuses]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const data = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page]);

  const handleSearch = () => {
    setPage(1);
  };

  const handleSaveStatuses = async () => {
    if (!hasEditedStatus || isBlocking) return;

    await runAction(async () => {
      const updatedOrders = await Promise.all(
        Object.entries(editedStatuses).map(([id, nextStatus]) =>
          updateAdminOrderStatus(Number(id), nextStatus)
        )
      );
      const byId = new Map(updatedOrders.map((order) => [order.id, mapApiOrder(order)]));
      setOrders((prev) => prev.map((order) => byId.get(order.id) ?? order));
      setEditedStatuses({});
    }, {
      loadingMessage: "Đang cập nhật đơn hàng...",
      successTitle: "Cập nhật thành công",
      successDescription: "Trạng thái đơn hàng đã được lưu.",
    });
  };

  const handleOpenTransferModal = (order: Order) => {
    setSelectedOrder(order);
    setPreviewImage(order.transferImage ?? "");
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setPreviewImage("");
  };

  const hasEditedStatus = Object.keys(editedStatuses).length > 0;

  return (
    <>
      <div className="space-y-4 md:space-y-5">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-[26px]">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Trang chủ / Quản lý đơn hàng
          </p>
        </div>

        <div className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 grid gap-3 md:mb-5 md:grid-cols-2 lg:grid-cols-[1.35fr_0.78fr_0.66fr_0.66fr_0.42fr_0.32fr]">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm đơn hàng..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="relative z-[9999]">
              <button
                type="button"
                onClick={() => setOpenStatusDropdown((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition hover:border-sky-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <span>
                  {statusOptions.find((item) => item.value === status)?.label ||
                    "Trạng thái"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition ${
                    openStatusDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openStatusDropdown && (
                <div className="absolute left-0 top-[50px] z-[99999] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {statusOptions.map((item) => {
                    const active = status === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setStatus(item.value);
                          setPage(1);
                          setOpenStatusDropdown(false);
                        }}
                        className={`flex h-11 w-full items-center justify-between px-4 text-left text-sm transition ${
                          active
                            ? "bg-sky-50 font-semibold text-sky-600"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{item.label}</span>

                        {active && (
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <DatePicker
              value={fromDate}
              onChange={(date) => {
                setFromDate(date);
                setPage(1);
              }}
              placeholder="Từ ngày"
            />

            <DatePicker
              value={toDate}
              onChange={(date) => {
                setToDate(date);
                setPage(1);
              }}
              placeholder="Đến ngày"
            />

            <button
              onClick={handleSearch}
              className="h-11 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Tìm kiếm
            </button>

            <button
              onClick={handleSaveStatuses}
              disabled={!hasEditedStatus || isBlocking}
              className="h-11 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBlocking ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>

          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 md:hidden">
            <span>{filteredOrders.length} đơn hàng</span>
            <span>Trang {page}/{totalPages}</span>
          </div>

          <div className="space-y-3 md:hidden">
            {data.map((order) => {
              const currentStatus = editedStatuses[order.id] ?? order.status;
              const isEdited = editedStatuses[order.id] !== undefined;

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">Mã đơn hàng</p>
                      <h2 className="mt-1 truncate text-base font-bold text-slate-900">{order.code}</h2>
                    </div>
                    <button
                      onClick={() => handleOpenTransferModal(order)}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                        order.transferImage
                          ? "border-sky-100 bg-sky-50 text-sky-600"
                          : "border-amber-100 bg-amber-50 text-amber-600"
                      }`}
                      title={order.transferImage ? "Xem ảnh chuyển khoản" : "Thêm ảnh chuyển khoản"}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Khách hàng</p>
                      <p className="mt-1 truncate font-semibold text-slate-700">{order.customer}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Tổng tiền</p>
                      <p className="mt-1 truncate font-semibold text-slate-900">{order.total}</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Ngày tạo</p>
                      <p className="mt-1 font-semibold text-slate-700">{formatDateTime(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Trạng thái {isEdited ? "(chưa lưu)" : ""}
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => {
                        const nextStatus = e.target.value as OrderStatus;

                        setEditedStatuses((prev) => {
                          if (nextStatus === order.status) {
                            const cloned = { ...prev };
                            delete cloned[order.id];
                            return cloned;
                          }

                          return {
                            ...prev,
                            [order.id]: nextStatus,
                          };
                        });
                      }}
                      className={`h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${
                        isEdited
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {editableStatusOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}

            {!isLoading && data.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                Không có đơn hàng phù hợp.
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-100 md:block">
            <table className="w-full text-sm">
              <thead className="bg-white text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-4 text-left font-semibold">
                    Mã đơn hàng
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Khách hàng
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-4 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map((order) => {
                  const currentStatus = editedStatuses[order.id] ?? order.status;
                  const isEdited = editedStatuses[order.id] !== undefined;

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 last:border-none hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {order.code}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {order.customer}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {order.total}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => {
                            const nextStatus = e.target.value as OrderStatus;

                            setEditedStatuses((prev) => {
                              if (nextStatus === order.status) {
                                const cloned = { ...prev };
                                delete cloned[order.id];
                                return cloned;
                              }

                              return {
                                ...prev,
                                [order.id]: nextStatus,
                              };
                            });
                          }}
                          className={`h-9 rounded-xl border px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 ${
                            isEdited
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {editableStatusOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleOpenTransferModal(order)}
                            className={`hover:text-sky-600 ${
                              order.transferImage
                                ? "text-sky-500"
                                : "text-amber-500"
                            }`}
                            title={
                              order.transferImage
                                ? "Xem ảnh chuyển khoản"
                                : "Thêm ảnh chuyển khoản"
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Không có đơn hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị{" "}
              {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1} đến{" "}
              {Math.min(page * pageSize, filteredOrders.length)} của {filteredOrders.length} đơn hàng
            </p>

            <div className="flex items-center justify-center gap-2 md:justify-end">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const item = index + 1;

                return (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold ${
                    page === item
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item}
                </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <TransferImageModal
        order={selectedOrder}
        previewImage={previewImage}
        onClose={handleCloseModal}
      />
    </>
  );
}





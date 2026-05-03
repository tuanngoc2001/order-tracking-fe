"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import DatePicker from "@/components/ui/date-picker";
import { useAppAction } from "@/components/app-action-provider";

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

const initialOrders: Order[] = [
  {
    id: 1,
    code: "#DH10086",
    customer: "Nguyễn Văn A",
    total: "2,350,000 đ",
    status: "processing",
    createdAt: "2024-05-24 10:30",
  },
  {
    id: 2,
    code: "#DH10085",
    customer: "Trần Thị B",
    total: "1,850,000 đ",
    status: "unpaid",
    createdAt: "2024-05-24 09:15",
    transferImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop",
  },
  {
    id: 3,
    code: "#DH10084",
    customer: "Lê Văn C",
    total: "3,450,000 đ",
    status: "completed",
    createdAt: "2024-05-23 16:45",
  },
  {
    id: 4,
    code: "#DH10083",
    customer: "Phạm Thị D",
    total: "950,000 đ",
    status: "cancelled",
    createdAt: "2024-05-23 14:20",
  },
  {
    id: 5,
    code: "#DH10082",
    customer: "Hoàng Văn E",
    total: "1,250,000 đ",
    status: "shipping",
    createdAt: "2024-05-23 11:05",
  },
  {
    id: 6,
    code: "#DH10081",
    customer: "Nguyễn Thị F",
    total: "2,750,000 đ",
    status: "completed",
    createdAt: "2024-05-22 18:30",
  },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TransferImageModal({
  order,
  mode,
  previewImage,
  onClose,
  onFileChange,
  onSave,
}: {
  order: Order | null;
  mode: "add" | "view";
  previewImage: string;
  onClose: () => void;
  onFileChange: (file: File) => void;
  onSave: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === "add" ? "Thêm ảnh chuyển khoản" : "Ảnh chuyển khoản"}
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
            <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
              <Upload className="mb-3 h-10 w-10 text-sky-500" />
              <p className="font-semibold text-slate-700">
                Bấm để chọn ảnh chuyển khoản
              </p>
              <p className="mt-1 text-sm text-slate-400">PNG, JPG, JPEG</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileChange(file);
                }}
              />
            </label>
          )}

          {mode === "add" && previewImage && (
            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Đổi ảnh khác
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileChange(file);
                  }}
                />
              </label>
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

          {mode === "add" && (
            <button
              onClick={onSave}
              disabled={!previewImage}
              className="h-11 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
            >
              Lưu ảnh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { isBlocking, runAction } = useAppAction();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
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
  const [modalMode, setModalMode] = useState<"add" | "view">("add");
  const [previewImage, setPreviewImage] = useState("");

  const pageSize = 6;

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

    await runAction(() => {
      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          status: editedStatuses[order.id] ?? order.status,
        }))
      );

      console.log("SAVE_ORDER_STATUSES", editedStatuses);

      // TODO: Sau này gọi API update trạng thái ở đây
      // await updateOrderStatuses(editedStatuses)

      setEditedStatuses({});
    }, {
      loadingMessage: "Đang cập nhật đơn hàng...",
      successTitle: "Cập nhật thành công",
      successDescription: "Trạng thái đơn hàng đã được lưu.",
    });
  };

  const handleOpenTransferModal = (order: Order) => {
    setSelectedOrder(order);

    if (order.transferImage) {
      setModalMode("view");
      setPreviewImage(order.transferImage);
    } else {
      setModalMode("add");
      setPreviewImage("");
    }
  };

  const handleFileChange = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };

  const handleSaveImage = async () => {
    if (!selectedOrder || !previewImage) return;

    await runAction(() => {
      setOrders((prev) =>
        prev.map((item) =>
          item.id === selectedOrder.id
            ? {
                ...item,
                transferImage: previewImage,
              }
            : item
        )
      );

      setSelectedOrder(null);
      setPreviewImage("");
    }, {
      loadingMessage: "Đang lưu ảnh chuyển khoản...",
      successTitle: "Lưu ảnh thành công",
      successDescription: `Ảnh chuyển khoản của đơn hàng ${selectedOrder.code} đã được lưu.`,
    });
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setPreviewImage("");
  };

  const hasEditedStatus = Object.keys(editedStatuses).length > 0;

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900">
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Trang chủ / Quản lý đơn hàng
          </p>
        </div>

        <div className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.35fr_0.78fr_0.66fr_0.66fr_0.42fr_0.32fr]">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

          <div className="overflow-hidden rounded-xl border border-slate-100">
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

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị{" "}
              {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1} đến{" "}
              {Math.min(page * pageSize, filteredOrders.length)} của 256 đơn hàng
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {[1, 2, 3, 4, 5].map((item) => (
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
              ))}

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
        mode={modalMode}
        previewImage={previewImage}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onSave={handleSaveImage}
      />
    </>
  );
}

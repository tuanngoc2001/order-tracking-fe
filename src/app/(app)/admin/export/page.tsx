"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { getMmoAccounts, getMmoProxies } from "@/lib/api-client";

type PlatformType = "tiktok" | "shopee";
type AccountStatus = "active" | "warning" | "locked";

type ExportFormat = "excel" | "csv" | "sheets";

type ExportRow = {
  id: number;
  platform: PlatformType;
  account: string;
  password: string;
  email: string;
  proxy: string;
  status: AccountStatus;
  createdAt: string;
  lockedDays: string;
  note: string;
};

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

const fieldOptions = [
  { key: "account", label: "Tài khoản" },
  { key: "password", label: "Mật khẩu" },
  { key: "email", label: "Email" },
  { key: "proxy", label: "Proxy" },
  { key: "status", label: "Trạng thái" },
  { key: "createdAt", label: "Ngày tạo" },
  { key: "updatedAt", label: "Ngày cập nhật" },
  { key: "lockedDays", label: "Đã khóa (ngày)" },
  { key: "note", label: "Ghi chú" },
];

function TikTokIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-[10px] font-bold text-white">
      ♪
    </div>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const map = {
    active: {
      label: "Hoạt động",
      dot: "bg-emerald-500",
      text: "text-emerald-500",
    },
    warning: {
      label: "Tạm khóa",
      dot: "bg-amber-500",
      text: "text-amber-500",
    },
    locked: {
      label: "Đã khóa",
      dot: "bg-rose-500",
      text: "text-rose-500",
    },
  };

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${map[status].text}`}>
      <span className={`h-2 w-2 rounded-full ${map[status].dot}`} />
      {map[status].label}
    </span>
  );
}

function FormatCard({
  active,
  title,
  desc,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-[86px] items-center gap-4 rounded-xl border px-4 text-left transition ${
        active
          ? "border-sky-500 bg-sky-50/40 ring-1 ring-sky-200"
          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
      </div>
    </button>
  );
}

export default function AdminExportPage() {
  const { isBlocking, runAction } = useAppAction();
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataType, setDataType] = useState("all");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    fieldOptions.reduce((acc, item) => {
      acc[item.key] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([getMmoAccounts(), getMmoProxies()])
      .then(([accounts, proxies]) => {
        if (!mounted) return;
        const accountRows: ExportRow[] = accounts.map((item) => ({
          id: item.id,
          platform: item.platform === "shopee" ? "shopee" : "tiktok",
          account: item.account,
          password: item.password,
          email: item.email,
          proxy: item.proxy || "-",
          status: item.status === "locked" || item.status === "warning" ? item.status : "active",
          createdAt: formatDateTime(item.createdAt),
          lockedDays: item.lockedDays || "-",
          note: item.note || "-",
        }));
        const proxyRows: ExportRow[] = proxies.map((item) => ({
          id: Number(`9${item.id}`),
          platform: "tiktok",
          account: `${item.ip}:${item.port}`,
          password: item.password || "",
          email: item.username,
          proxy: `${item.ip}:${item.port}`,
          status: item.status === "error" || item.status === "expired" ? "locked" : "active",
          createdAt: formatDateTime(item.createdAt),
          lockedDays: item.expiredDate || "-",
          note: item.note || "-",
        }));
        setRows(dataType === "proxy" ? proxyRows : dataType === "account" ? accountRows : [...accountRows, ...proxyRows]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [dataType]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = status === "all" || row.status === status;
      const matchPlatform = platform === "all" || row.platform === platform;
      return matchStatus && matchPlatform;
    });
  }, [rows, status, platform]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handleReset = () => {
    setDataType("all");
    setStatus("all");
    setPlatform("all");
    setFormat("excel");
    setPage(1);
  };

  const handleExport = async () => {
    await runAction(() => {
      console.log("EXPORT_DATA", {
        dataType,
        status,
        platform,
        format,
        selectedFields,
        rows: filteredRows,
      });
    }, {
      loadingMessage: "Đang xuất dữ liệu...",
      successTitle: "Xuất dữ liệu thành công",
      successDescription: `${filteredRows.length} bản ghi đã được chuẩn bị.`,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[30px] font-bold text-slate-900">
          MMO Accounts - Xuất dữ liệu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xuất dữ liệu tài khoản và proxy theo nhu cầu
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-slate-700">
            1. Chọn dữ liệu cần xuất
          </h2>

          <button
            onClick={handleReset}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
          >
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Loại dữ liệu
            </label>
            <div className="relative">
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Tất cả tài khoản</option>
                <option value="account">Tài khoản</option>
                <option value="proxy">Proxy</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="warning">Tạm khóa</option>
                <option value="locked">Đã khóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nền tảng
            </label>
            <div className="relative">
              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Tất cả</option>
                <option value="tiktok">TikTok</option>
                <option value="shopee">Shopee</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Khoảng thời gian tạo
            </label>
            <button className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
              <span>01/06/2024</span>
              <span className="text-slate-400">→</span>
              <span>23/06/2024</span>
              <CalendarDays className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Chọn cột dữ liệu muốn xuất
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {fieldOptions.map((field) => (
              <label
                key={field.key}
                className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selectedFields[field.key]}
                  onChange={(e) =>
                    setSelectedFields((prev) => ({
                      ...prev,
                      [field.key]: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                />
                {field.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
          <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
            <h2 className="mb-5 text-sm font-bold uppercase text-slate-700">
              2. Chọn định dạng xuất
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <FormatCard
                active={format === "excel"}
                title="Excel (.xlsx)"
                desc="Phù hợp để xem và chỉnh sửa"
                icon={<FileSpreadsheet className="h-5 w-5" />}
                onClick={() => setFormat("excel")}
              />

              <FormatCard
                active={format === "csv"}
                title="CSV (.csv)"
                desc="Phù hợp để nhập liệu hàng loạt"
                icon={<FileSpreadsheet className="h-5 w-5" />}
                onClick={() => setFormat("csv")}
              />

              <FormatCard
                active={format === "sheets"}
                title="Google Sheets"
                desc="Xuất trực tiếp lên Google Sheets"
                icon={<FileSpreadsheet className="h-5 w-5" />}
                onClick={() => setFormat("sheets")}
              />
            </div>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="mb-4 text-sm font-bold uppercase text-slate-700">
                Tổng quan dữ liệu
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tổng bản ghi</span>
                  <span className="font-bold text-slate-800">{rows.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bản ghi sau lọc</span>
                  <span className="font-bold text-slate-800">
                    {filteredRows.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dung lượng ước tính</span>
                  <span className="font-bold text-slate-800">~ 45 KB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <button
                onClick={handleExport}
                disabled={isBlocking}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Xuất dữ liệu
              </button>

              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-sky-600 transition hover:bg-sky-50">
                <Eye className="h-4 w-4" />
                Xem trước dữ liệu
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold uppercase text-slate-700">
            3. Xem trước dữ liệu (hiển thị 10 bản ghi đầu tiên)
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Hiển thị {Math.min(pageSize, filteredRows.length)}/{filteredRows.length} bản ghi
            </span>
            <button className="h-9 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-sky-600 hover:bg-sky-50">
              Xem tất cả
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-white text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 text-left font-semibold">STT</th>
                <th className="px-4 py-4 text-left font-semibold">Nền tảng</th>
                <th className="px-4 py-4 text-left font-semibold">Tài khoản</th>
                <th className="px-4 py-4 text-left font-semibold">Mật khẩu</th>
                <th className="px-4 py-4 text-left font-semibold">Email</th>
                <th className="px-4 py-4 text-left font-semibold">Proxy</th>
                <th className="px-4 py-4 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-4 text-left font-semibold">Ngày tạo</th>
                <th className="px-4 py-4 text-left font-semibold">Đã khóa (ngày)</th>
                <th className="px-4 py-4 text-left font-semibold">Ghi chú</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-none">
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <TikTokIcon />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.account}</td>
                  <td className="px-4 py-4 tracking-[2px] text-slate-600">••••••••</td>
                  <td className="px-4 py-4 text-slate-600">{row.email}</td>
                  <td className="px-4 py-4 text-slate-600">{row.proxy}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">{row.createdAt}</td>
                  <td className="px-4 py-4 text-slate-600">{row.lockedDays}</td>
                  <td className="px-4 py-4 text-slate-600">{row.note}</td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
              {!isLoading && pagedRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 outline-none"
            >
              <option value={10}>10</option>
              <option value={5}>5</option>
            </select>
            <span>trên {filteredRows.length} kết quả</span>
          </div>

          <div className="flex items-center gap-2">
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

            {totalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}


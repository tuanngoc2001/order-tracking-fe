"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Eye,
  EyeOff,
  Filter,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppAction } from "@/components/app-action-provider";
import {
  createMmoProxy,
  deleteMmoProxy,
  getMmoProxies,
  invalidateApiCache,
  updateMmoProxy,
  updateMmoProxyStatus,
  type MmoProxyResponse,
} from "@/lib/api-client";

type ProxyType = "HTTP" | "HTTPS" | "SOCKS5";
type ProxyStatus = "active" | "warning" | "locked" | "error" | "expired";

type ProxyItem = {
  id: number;
  ip: string;
  port: string;
  type: ProxyType;
  country: string;
  countryCode: string;
  username: string;
  password: string;
  status: ProxyStatus;
  expiredDate: string;
  note: string;
  createdAt: string;
};

type CreateProxyForm = {
  ip: string;
  port: string;
  type: ProxyType;
  country: string;
  countryCode: string;
  username: string;
  password: string;
  status: ProxyStatus;
  expiredDate: string;
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

function mapApiProxy(item: MmoProxyResponse): ProxyItem {
  return {
    id: item.id,
    ip: item.ip,
    port: item.port,
    type: item.type === "HTTPS" || item.type === "SOCKS5" ? item.type : "HTTP",
    country: item.country,
    countryCode: item.countryCode,
    username: item.username,
    password: item.password || "",
    status: ["active", "warning", "locked", "error", "expired"].includes(item.status)
      ? (item.status as ProxyStatus)
      : "warning",
    expiredDate: item.expiredDate || "-",
    note: item.note || "-",
    createdAt: formatDateTime(item.createdAt),
  };
}

const countryCodeByName: Record<string, string> = {
  Vietnam: "VN",
  "United States": "US",
  Japan: "JP",
  Germany: "DE",
  France: "FR",
  Singapore: "SG",
  "United Kingdom": "GB",
  Canada: "CA",
};

const countryFlagByCode: Record<string, string> = {
  VN: "🇻🇳",
  US: "🇺🇸",
  JP: "🇯🇵",
  DE: "🇩🇪",
  FR: "🇫🇷",
  SG: "🇸🇬",
  GB: "🇬🇧",
  CA: "🇨🇦",
};

const initialForm: CreateProxyForm = {
  ip: "",
  port: "",
  type: "HTTP",
  country: "Vietnam",
  countryCode: "VN",
  username: "",
  password: "",
  status: "active",
  expiredDate: "",
  note: "",
};

function getCountryCode(country: string) {
  return countryCodeByName[country] ?? country.slice(0, 2).toUpperCase();
}

function StatusDot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function CountryFlag({ code }: { code: string }) {
  return (
    <span className="inline-flex h-5 w-7 items-center justify-center overflow-hidden rounded-[4px] border border-slate-100 bg-white text-base leading-none shadow-sm">
      {countryFlagByCode[code] ?? "🏳️"}
    </span>
  );
}

function CountryCell({ country, countryCode }: { country: string; countryCode: string }) {
  return (
    <div className="flex items-center justify-center" title={country}>
      <CountryFlag code={countryCode} />
    </div>
  );
}

function StatusBadge({ status }: { status: ProxyStatus }) {
  const map = {
    active: {
      label: "Đang sử dụng",
      dot: "bg-emerald-500",
      text: "text-emerald-600",
    },
    warning: {
      label: "Khả dụng",
      dot: "bg-blue-500",
      text: "text-blue-600",
    },
    locked: {
      label: "Đã khóa",
      dot: "bg-slate-500",
      text: "text-slate-500",
    },
    error: {
      label: "Đã lỗi",
      dot: "bg-rose-500",
      text: "text-rose-600",
    },
    expired: {
      label: "Đã hết hạn",
      dot: "bg-orange-500",
      text: "text-orange-500",
    },
  };

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-semibold ${map[status].text}`}>
      <StatusDot className={map[status].dot} />
      {map[status].label}
    </div>
  );
}

function TypeBadge({ type }: { type: ProxyType }) {
  const map = {
    HTTP: "border-blue-200 bg-blue-50 text-blue-600",
    HTTPS: "border-violet-200 bg-violet-50 text-violet-600",
    SOCKS5: "border-emerald-200 bg-emerald-50 text-emerald-600",
  };

  return (
    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${map[type]}`}>
      {type}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  percent,
  icon,
}: {
  title: string;
  value: string;
  percent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {icon}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-700">{title}</div>
          <div className="mt-4 text-[30px] font-bold leading-none text-slate-900">
            {value}
          </div>
          <div className="mt-4 text-sm font-medium text-slate-400">{percent}</div>
        </div>
      </div>
    </div>
  );
}

function AddProxyModal({
  open,
  form,
  onClose,
  onChange,
  onSubmit,
  isSubmitting = false,
  title = "Thêm proxy mới",
  description = "Nhập thông tin proxy để thêm vào hệ thống",
  submitLabel = "Thêm proxy",
}: {
  open: boolean;
  form: CreateProxyForm;
  onClose: () => void;
  onChange: (field: keyof CreateProxyForm, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
}) {
  if (!open) return null;

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const handleCountryChange = (value: string) => {
    onChange("country", value);
    onChange("countryCode", getCountryCode(value));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">IP</label>
            <input
              value={form.ip}
              onChange={(event) => onChange("ip", event.target.value)}
              placeholder="Ví dụ: 103.162.4.23"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Port</label>
            <input
              value={form.port}
              onChange={(event) => onChange("port", event.target.value)}
              placeholder="Ví dụ: 8080"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Loại proxy</label>
            <select
              value={form.type}
              onChange={(event) => onChange("type", event.target.value)}
              className={inputClass}
            >
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="SOCKS5">SOCKS5</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Quốc gia</label>
            <select
              value={form.country}
              onChange={(event) => handleCountryChange(event.target.value)}
              className={inputClass}
            >
              {Object.keys(countryCodeByName).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tên đăng nhập</label>
            <input
              value={form.username}
              onChange={(event) => onChange("username", event.target.value)}
              placeholder="Nhập tên đăng nhập"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder="Nhập mật khẩu"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={form.status}
              onChange={(event) => onChange("status", event.target.value)}
              className={inputClass}
            >
              <option value="active">Đang sử dụng</option>
              <option value="warning">Khả dụng</option>
              <option value="error">Đã lỗi</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Hết hạn</label>
            <input
              value={form.expiredDate}
              onChange={(event) => onChange("expiredDate", event.target.value)}
              placeholder="Ví dụ: 25/06/2024"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Ghi chú</label>
            <input
              value={form.note}
              onChange={(event) => onChange("note", event.target.value)}
              placeholder="Nhập ghi chú"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-lg bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMMOProxyPage() {
  const { toast } = useToast();
  const { isBlocking, runAction } = useAppAction();
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState<CreateProxyForm>(initialForm);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState<CreateProxyForm>(initialForm);
  const [selectedProxy, setSelectedProxy] = useState<ProxyItem | null>(null);

  const loadProxies = useCallback(async ({ force = false } = {}) => {
    if (force) {
      invalidateApiCache("admin/mmo/proxies");
    }
    setIsLoading(true);

    try {
      const items = await getMmoProxies();
      setProxies(items.map(mapApiProxy));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    loadProxies().catch(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [loadProxies]);

  const filteredProxies = useMemo(() => {
    let data = [...proxies];

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.ip.toLowerCase().includes(keyword) ||
          item.username.toLowerCase().includes(keyword) ||
          item.country.toLowerCase().includes(keyword) ||
          item.note.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      data = data.filter((item) => item.type === typeFilter);
    }

    if (countryFilter !== "all") {
      data = data.filter((item) => item.country === countryFilter);
    }

    return data;
  }, [proxies, search, statusFilter, typeFilter, countryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, countryFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProxies.length / pageSize));

  const pagedProxies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProxies.slice(start, start + pageSize);
  }, [filteredProxies, currentPage, pageSize]);

  const allStats = useMemo(() => {
    const total = proxies.length;
    const active = proxies.filter((item) => item.status === "active").length;
    const warning = proxies.filter((item) => item.status === "warning").length;
    const locked = proxies.filter((item) => item.status === "locked").length;
    const error = proxies.filter((item) => item.status === "error").length;
    const expired = proxies.filter((item) => item.status === "expired").length;

    const percent = (value: number) =>
      total === 0 ? "0%" : `${((value / total) * 100).toFixed(1)}%`;

    return {
      total,
      active,
      warning,
      locked,
      error,
      expired,
      activePercent: percent(active),
      warningPercent: percent(warning),
      lockedPercent: percent(locked),
      errorPercent: percent(error),
      expiredPercent: percent(expired),
    };
  }, [proxies]);

  const countryList = useMemo(
    () => Array.from(new Set(proxies.map((proxy) => proxy.country))),
    [proxies]
  );

  const togglePassword = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: `Đã sao chép ${label.toLowerCase()}`,
        description: (
          <span className="inline-flex max-w-full rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
            {value}
          </span>
        ),
      });
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Trình duyệt chưa cho phép truy cập clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCountryFilter("all");
    setCurrentPage(1);
  };

  const handleRefreshProxies = async () => {
    await runAction(async () => {
      await loadProxies({ force: true });
      setCurrentPage(1);
    }, {
      loadingMessage: "Đang làm mới dữ liệu proxy...",
      successTitle: "Đã làm mới dữ liệu",
      successDescription: "Danh sách proxy đã được tải lại từ database.",
    });
  };

  const handleFormChange = (field: keyof CreateProxyForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFormChange = (field: keyof CreateProxyForm, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddProxy = async () => {
    if (!form.ip.trim() || !form.port.trim() || !form.username.trim()) {
      return;
    }

    await runAction(async () => {
      const country = form.country.trim();
      const newItem = await createMmoProxy({
        ip: form.ip.trim(),
        port: form.port.trim(),
        type: form.type,
        country,
        countryCode: form.countryCode || getCountryCode(country),
        username: form.username.trim(),
        password: form.password.trim(),
        status: form.status,
        expiredDate: form.expiredDate.trim() || "-",
        note: form.note.trim() || "-",
      });

      setProxies((prev) => [mapApiProxy(newItem), ...prev]);
      setOpenAddModal(false);
      setForm(initialForm);
      setCurrentPage(1);
    }, {
      loadingMessage: "Đang thêm proxy...",
      successTitle: "Thêm proxy thành công",
      successDescription: "Proxy mới đã được thêm vào danh sách.",
    });
  };

  const handleLockProxy = async (id: number) => {
    await runAction(async () => {
      const updated = await updateMmoProxyStatus(id, "locked");
      setProxies((prev) => prev.map((item) => (item.id === id ? mapApiProxy(updated) : item)));
    }, {
      loadingMessage: "Đang khóa proxy...",
      successTitle: "Đã khóa proxy",
      successDescription: "Trạng thái proxy đã được cập nhật trong database.",
    });
  };

  const handleDeleteProxy = async (id: number) => {
    await deleteMmoProxy(id);
    setProxies((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenEditProxy = (proxy: ProxyItem) => {
    setSelectedProxy(proxy);
    setEditForm({
      ip: proxy.ip,
      port: proxy.port,
      type: proxy.type,
      country: proxy.country,
      countryCode: proxy.countryCode,
      username: proxy.username,
      password: proxy.password,
      status: proxy.status,
      expiredDate: proxy.expiredDate,
      note: proxy.note,
    });
    setOpenEditModal(true);
  };

  const handleUpdateProxy = async () => {
    if (!selectedProxy || !editForm.ip.trim() || !editForm.port.trim() || !editForm.username.trim()) {
      return;
    }

    await runAction(async () => {
      const country = editForm.country.trim();
      const updated = await updateMmoProxy(selectedProxy.id, {
        ip: editForm.ip.trim(),
        port: editForm.port.trim(),
        type: editForm.type,
        country,
        countryCode: editForm.countryCode || getCountryCode(country),
        username: editForm.username.trim(),
        password: editForm.password.trim(),
        status: editForm.status,
        expiredDate: editForm.expiredDate.trim() || "-",
        note: editForm.note.trim() || "-",
      });
      setProxies((prev) => prev.map((item) => (item.id === selectedProxy.id ? mapApiProxy(updated) : item)));

      setOpenEditModal(false);
      setSelectedProxy(null);
      setEditForm(initialForm);
    }, {
      loadingMessage: "Đang lưu proxy...",
      successTitle: "Cập nhật proxy thành công",
      successDescription: "Thông tin proxy đã được lưu.",
    });
  };

  const pageNumbers = Array.from({ length: totalPages }).slice(0, 5);

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-[30px] font-bold leading-tight text-slate-900">
            MMO Accounts - Proxy
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý proxy sử dụng cho các tài khoản MMO
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setOpenAddModal(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            <Plus className="h-4 w-4" />
            Thêm proxy
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <SummaryCard
            title="Tổng proxy"
            value={String(allStats.total)}
            percent="100% tổng số"
            icon={
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                <Server className="h-6 w-6" />
              </div>
            }
          />

          <SummaryCard
            title="Đang sử dụng"
            value={String(allStats.active)}
            percent={allStats.activePercent}
            icon={
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <StatusDot className="bg-emerald-500" />
              </div>
            }
          />

          <SummaryCard
            title="Đã khóa"
            value={String(allStats.locked)}
            percent={allStats.lockedPercent}
            icon={
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <StatusDot className="bg-slate-500" />
              </div>
            }
          />

          <SummaryCard
            title="Đã lỗi"
            value={String(allStats.error)}
            percent={allStats.errorPercent}
            icon={
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50">
                <StatusDot className="bg-rose-500" />
              </div>
            }
          />

          <SummaryCard
            title="Đã hết hạn"
            value={String(allStats.expired)}
            percent={allStats.expiredPercent}
            icon={
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50">
                <StatusDot className="bg-orange-500" />
              </div>
            }
          />
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.9fr_0.8fr_0.9fr_0.55fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm IP, host, ghi chú..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="active">Đang sử dụng</option>
                <option value="warning">Khả dụng</option>
                <option value="locked">Đã khóa</option>
                <option value="error">Đã lỗi</option>
                <option value="expired">Đã hết hạn</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Loại: Tất cả</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
                <option value="SOCKS5">SOCKS5</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Quốc gia: Tất cả</option>
                {countryList.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              onClick={handleResetFilter}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>

          <button
            onClick={handleRefreshProxies}
            disabled={isBlocking || isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] text-sm">
              <thead className="border-b border-slate-100 bg-white text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-4">IP:PORT</th>
                  <th className="px-3 py-4">Loại proxy</th>
                  <th className="px-3 py-4 text-center">Quốc gia</th>
                  <th className="px-3 py-4">Tên đăng nhập</th>
                  <th className="px-3 py-4">Mật khẩu</th>
                  <th className="px-3 py-4">Trạng thái</th>
                  <th className="px-3 py-4">Hết hạn</th>
                  <th className="px-3 py-4">Ghi chú</th>
                  <th className="px-3 py-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {pagedProxies.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50/80 last:border-none"
                  >
                    <td className="px-3 py-4 font-mono text-slate-700">
                      {item.ip}:{item.port}
                    </td>

                    <td className="px-3 py-4">
                      <TypeBadge type={item.type} />
                    </td>

                    <td className="px-3 py-4 text-slate-600">
                      <CountryCell country={item.country} countryCode={item.countryCode} />
                    </td>

                    <td className="px-3 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <span>{item.username}</span>
                        <button
                          onClick={() => handleCopy(item.username, "Tên đăng nhập")}
                          className="text-slate-400 transition hover:text-sky-500"
                          title="Sao chép tên đăng nhập"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-4">
                        <span className="font-bold tracking-[3px] text-slate-900">
                          {visiblePasswords[item.id] ? item.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(item.id)}
                          className="text-slate-400 transition hover:text-sky-500"
                          title={visiblePasswords[item.id] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {visiblePasswords[item.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(item.password, "Mật khẩu")}
                          className="text-slate-400 transition hover:text-sky-500"
                          title="Sao chép mật khẩu"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-3 py-4 text-slate-600">{item.expiredDate}</td>

                    <td className="px-3 py-4 text-slate-600">{item.note}</td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => handleOpenEditProxy(item)}
                          className="text-sky-500 transition hover:scale-110 hover:text-sky-600"
                          title="Chỉnh sửa proxy"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleLockProxy(item.id)}
                          disabled={item.status === "locked" || isBlocking}
                          className="text-sky-500 transition hover:scale-110 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                          title={item.status === "locked" ? "Proxy đã khóa" : "Khóa proxy"}
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProxy(item.id)}
                          className="text-rose-500 transition hover:scale-110 hover:text-rose-600"
                          title="Xóa proxy"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pagedProxies.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                      Không có dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <span>trên {filteredProxies.length} kết quả</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageNumbers.map((_, idx) => {
                const page = idx + 1;
                const active = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      active
                        ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddProxyModal
        open={openAddModal}
        form={form}
        onClose={() => {
          setOpenAddModal(false);
          setForm(initialForm);
        }}
        onChange={handleFormChange}
        onSubmit={handleAddProxy}
        isSubmitting={isBlocking}
      />

      <AddProxyModal
        open={openEditModal}
        form={editForm}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedProxy(null);
          setEditForm(initialForm);
        }}
        onChange={handleEditFormChange}
        onSubmit={handleUpdateProxy}
        isSubmitting={isBlocking}
        title="Chỉnh sửa proxy"
        description="Cập nhật thông tin proxy đang chọn"
        submitLabel="Lưu thay đổi"
      />
    </>
  );
}



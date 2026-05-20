"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Search,
  Pencil,
  Lock,
  LockOpen,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import {
  createMmoAccount,
  deleteMmoAccount,
  getMmoAccounts,
  updateMmoAccountStatus,
  type MmoAccountResponse,
} from "@/lib/api-client";

type PlatformType = "tiktok" | "shopee";
type AccountStatus = "active" | "warning" | "locked" | "inactive";

type MMOAccountItem = {
  id: number;
  platform: PlatformType;
  account: string;
  password: string;
  email: string;
  proxy: string;
  status: AccountStatus;
  lockedDays: string;
  createdAt: string;
  note?: string;
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

function mapApiAccount(item: MmoAccountResponse): MMOAccountItem {
  return {
    id: item.id,
    platform: item.platform === "shopee" ? "shopee" : "tiktok",
    account: item.account,
    password: item.password,
    email: item.email,
    proxy: item.proxy || "-",
    status: ["active", "warning", "locked", "inactive"].includes(item.status)
      ? (item.status as AccountStatus)
      : "inactive",
    lockedDays: item.lockedDays || "-",
    createdAt: formatDateTime(item.createdAt),
    note: item.note ?? undefined,
  };
}

type CreateAccountForm = {
  platform: PlatformType;
  account: string;
  password: string;
  email: string;
  proxy: string;
  status: AccountStatus;
  lockedDays: string;
  note: string;
};

const initialForm: CreateAccountForm = {
  platform: "tiktok",
  account: "",
  password: "",
  email: "",
  proxy: "",
  status: "active",
  lockedDays: "",
  note: "",
};

function TikTokIcon() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-[11px] font-bold text-white shadow-sm">
      ♪
    </div>
  );
}

function ShopeeIcon() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-[11px] font-bold text-white shadow-sm">
      S
    </div>
  );
}

function PlatformBadge({ platform }: { platform: PlatformType }) {
  return platform === "tiktok" ? <TikTokIcon /> : <ShopeeIcon />;
}

function StatusDot({ className }: { className: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />;
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
    inactive: {
      label: "Không hoạt động",
      dot: "bg-slate-400",
      text: "text-slate-400",
    },
  };

  return (
    <div className={`inline-flex items-center gap-2 text-sm font-medium ${map[status].text}`}>
      <StatusDot className={map[status].dot} />
      {map[status].label}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  percent,
  icon,
  dot,
}: {
  title: string;
  value: string;
  percent: string;
  icon?: React.ReactNode;
  dot?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        {icon ? icon : dot}
        <span className="text-sm font-medium text-slate-700">{title}</span>
      </div>

      <div className="text-[36px] font-bold leading-none tracking-tight text-slate-900">
        {value}
      </div>

      <div className="mt-3 text-sm text-slate-400">{percent}</div>
    </div>
  );
}

function AccountDetailsModal({
  open,
  account,
  onClose,
}: {
  open: boolean;
  account: MMOAccountItem | null;
  onClose: () => void;
}) {
  if (!open || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Thông tin tài khoản</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nền tảng</label>
            <p className="mt-1 text-sm text-slate-600">{account.platform === "tiktok" ? "TikTok" : "Shopee"}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Tài khoản</label>
            <p className="mt-1 text-sm text-slate-600">{account.account}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
            <p className="mt-1 text-sm font-mono tracking-widest text-slate-600">{account.password}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <p className="mt-1 text-sm text-slate-600">{account.email}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Proxy</label>
            <p className="mt-1 text-sm text-slate-600">{account.proxy}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Trạng thái</label>
            <div className="mt-1"><StatusBadge status={account.status} /></div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Đã khóa (ngày)</label>
            <p className="mt-1 text-sm text-slate-600">{account.lockedDays}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Ngày tạo</label>
            <p className="mt-1 text-sm text-slate-600">{account.createdAt}</p>
          </div>

          {account.note && (
            <div>
              <label className="text-sm font-semibold text-slate-700">Ghi chú</label>
              <p className="mt-1 text-sm text-slate-600">{account.note}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl bg-sky-500 px-6 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAccountModal({
  open,
  form,
  onClose,
  onChange,
  onSubmit,
  isSubmitting = false,
}: {
  open: boolean;
  form: CreateAccountForm;
  onClose: () => void;
  onChange: (field: keyof CreateAccountForm, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}) {
  if (!open) return null;

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Thêm tài khoản MMO</h3>
            <p className="mt-1 text-sm text-slate-500">
              Nhập thông tin tài khoản mới để thêm vào hệ thống
            </p>
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
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nền tảng
            </label>
            <select
              value={form.platform}
              onChange={(e) => onChange("platform", e.target.value)}
              className={inputClass}
            >
              <option value="tiktok">TikTok</option>
              <option value="shopee">Shopee</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tài khoản
            </label>
            <input
              value={form.account}
              onChange={(e) => onChange("account", e.target.value)}
              placeholder="Nhập tên tài khoản"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Nhập mật khẩu"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Nhập email"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Proxy
            </label>
            <input
              value={form.proxy}
              onChange={(e) => onChange("proxy", e.target.value)}
              placeholder="Ví dụ: 103.162.4.23:8080"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Trạng thái
            </label>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
              className={inputClass}
            >
              <option value="active">Hoạt động</option>
              <option value="warning">Tạm khóa</option>
              <option value="locked">Đã khóa</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Đã khóa (ngày)
            </label>
            <input
              value={form.lockedDays}
              onChange={(e) => onChange("lockedDays", e.target.value)}
              placeholder="Ví dụ: 3 ngày"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ghi chú
            </label>
            <input
              value={form.note}
              onChange={(e) => onChange("note", e.target.value)}
              placeholder="Nhập ghi chú"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Thêm tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMMOPage() {
  const { isBlocking, runAction } = useAppAction();
  const [accounts, setAccounts] = useState<MMOAccountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformTab, setPlatformTab] = useState<"all" | PlatformType>("tiktok");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lockedFilter, setLockedFilter] = useState("all");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [form, setForm] = useState<CreateAccountForm>(initialForm);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MMOAccountItem | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getMmoAccounts()
      .then((items) => {
        if (mounted) setAccounts(items.map(mapApiAccount));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredAccounts = useMemo(() => {
    let data = [...accounts];

    if (platformTab !== "all") {
      data = data.filter((item) => item.platform === platformTab);
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (item) =>
          item.account.toLowerCase().includes(keyword) ||
          item.email.toLowerCase().includes(keyword) ||
          item.proxy.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (lockedFilter === "locked") {
      data = data.filter((item) => item.lockedDays !== "-");
    }

    return data;
  }, [accounts, platformTab, search, statusFilter, lockedFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [platformTab, search, statusFilter, lockedFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));

  const pagedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const allStats = useMemo(() => {
    const source =
      platformTab === "all"
        ? accounts
        : accounts.filter((item) => item.platform === platformTab);

    const total = source.length;
    const active = source.filter((item) => item.status === "active").length;
    const warning = source.filter((item) => item.status === "warning").length;
    const locked = source.filter((item) => item.status === "locked").length;
    const inactive = source.filter((item) => item.status === "inactive").length;

    const percent = (value: number) =>
      total === 0 ? "0%" : `${((value / total) * 100).toFixed(1)}%`;

    return {
      total,
      active,
      warning,
      locked,
      inactive,
      totalPercent:
        platformTab === "all"
          ? "100% tổng số"
          : `${(accounts.length === 0 ? 0 : (total / accounts.length) * 100).toFixed(1)}% tổng số`,
      activePercent: percent(active),
      warningPercent: percent(warning),
      lockedPercent: percent(locked),
      inactivePercent: percent(inactive),
    };
  }, [platformTab, accounts]);

  const tabCounts = useMemo(() => {
    const all = accounts.length;
    const tiktok = accounts.filter((item) => item.platform === "tiktok").length;
    const shopee = accounts.filter((item) => item.platform === "shopee").length;

    return { all, tiktok, shopee };
  }, [accounts]);

  const togglePassword = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTabChange = (tab: "all" | PlatformType) => {
    setPlatformTab(tab);
  };

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter("all");
    setLockedFilter("all");
    setCurrentPage(1);
  };

  const handleFormChange = (field: keyof CreateAccountForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const handleAddAccount = async () => {
    if (!form.account.trim() || !form.password.trim() || !form.email.trim()) {
      return;
    }

    await runAction(async () => {
      const newItem = await createMmoAccount({
        platform: form.platform,
        account: form.account.trim(),
        password: form.password.trim(),
        email: form.email.trim(),
        proxy: form.proxy.trim() || "-",
        status: form.status,
        lockedDays: form.lockedDays.trim() || "-",
        note: form.note.trim(),
      });

      setAccounts((prev) => [mapApiAccount(newItem), ...prev]);
      setOpenAddModal(false);
      setForm(initialForm);
      setCurrentPage(1);
    }, {
      loadingMessage: "Đang thêm tài khoản MMO...",
      successTitle: "Thêm tài khoản thành công",
      successDescription: "Tài khoản MMO mới đã được thêm vào danh sách.",
    });
  };

  const handleLockAccount = async (id: number) => {
    const updated = await updateMmoAccountStatus(id, { status: "warning", lockedDays: "1 ngày" });
    setAccounts((prev) => prev.map((item) => (item.id === id ? mapApiAccount(updated) : item)));
  };

  const handleUnlockAccount = async (id: number) => {
    const updated = await updateMmoAccountStatus(id, { status: "active", lockedDays: "-" });
    setAccounts((prev) => prev.map((item) => (item.id === id ? mapApiAccount(updated) : item)));
  };

  const handleDeleteAccount = async (id: number) => {
    await deleteMmoAccount(id);
    setAccounts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleViewDetails = (account: MMOAccountItem) => {
    setSelectedAccount(account);
    setOpenDetailsModal(true);
  };

  const renderTab = ({
    value,
    label,
    icon,
    count,
  }: {
    value: "all" | PlatformType;
    label: string;
    icon?: React.ReactNode;
    count: number;
  }) => {
    const active = platformTab === value;

    return (
      <button
        onClick={() => handleTabChange(value)}
        className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-all duration-300 ${
          active ? "text-sky-600" : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {icon}
        <span>{label}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all ${
            active ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>

        <span
          className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-sky-500 transition-all duration-300 ${
            active ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        />
      </button>
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight text-slate-900">
            MMO Accounts - Danh sách tài khoản
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản các nền tảng MMO (TikTok, Shopee, v.v.)
          </p>
        </div>

        <div className="border-b border-slate-200">
          <div className="flex items-center gap-7">
            {renderTab({
              value: "all",
              label: "Tất cả",
              count: tabCounts.all,
            })}

            {renderTab({
              value: "tiktok",
              label: "TikTok",
              icon: <TikTokIcon />,
              count: tabCounts.tiktok,
            })}

            {renderTab({
              value: "shopee",
              label: "Shopee",
              icon: <ShopeeIcon />,
              count: tabCounts.shopee,
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_0.75fr_0.75fr_0.42fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm tài khoản..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="warning">Tạm khóa</option>
                <option value="locked">Đã khóa</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={lockedFilter}
                onChange={(e) => setLockedFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none transition-all duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="all">Đã khóa: Tất cả</option>
                <option value="locked">Có ngày khóa</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              onClick={handleResetFilter}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-sky-600 transition-all duration-200 hover:bg-sky-50 active:scale-[0.98]">
              <Download className="h-4 w-4" />
              Import Excel
            </button>

            <button
              onClick={() => setOpenAddModal(true)}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-600 hover:shadow active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Thêm tài khoản
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-5">
          <SummaryCard
            title={`Tài khoản ${
              platformTab === "shopee"
                ? "Shopee"
                : platformTab === "all"
                  ? "MMO"
                  : "TikTok"
            }`}
            value={String(allStats.total)}
            percent={allStats.totalPercent}
            icon={
              platformTab === "shopee" ? (
                <ShopeeIcon />
              ) : platformTab === "all" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-50 text-[11px] font-bold text-sky-600">
                  A
                </div>
              ) : (
                <TikTokIcon />
              )
            }
          />

          <SummaryCard
            title="Hoạt động"
            value={String(allStats.active)}
            percent={allStats.activePercent}
            dot={<StatusDot className="bg-emerald-500" />}
          />

          <SummaryCard
            title="Tạm khóa"
            value={String(allStats.warning)}
            percent={allStats.warningPercent}
            dot={<StatusDot className="bg-amber-500" />}
          />

          <SummaryCard
            title="Đã khóa"
            value={String(allStats.locked)}
            percent={allStats.lockedPercent}
            dot={<StatusDot className="bg-rose-500" />}
          />

          <SummaryCard
            title="Không hoạt động"
            value={String(allStats.inactive)}
            percent={allStats.inactivePercent}
            dot={<StatusDot className="bg-slate-400" />}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-100 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-4 font-medium">Tài khoản</th>
                  <th className="px-3 py-4 font-medium">Mật khẩu</th>
                  <th className="px-3 py-4 font-medium">Email</th>
                  <th className="px-3 py-4 font-medium">Proxy</th>
                  <th className="px-3 py-4 font-medium">Trạng thái</th>
                  <th className="px-3 py-4 font-medium">Đã khóa (ngày)</th>
                  <th className="px-3 py-4 font-medium">Ngày tạo</th>
                  <th className="px-3 py-4 text-center font-medium">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {pagedAccounts.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-slate-700 transition-colors hover:bg-slate-50/80 last:border-none"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={item.platform} />
                        <span className="font-medium text-slate-800">{item.account}</span>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium tracking-[2px] text-slate-800">
                          {visiblePasswords[item.id] ? item.password : "⬢⬢⬢⬢⬢⬢⬢⬢"}
                        </span>
                        <button
                          onClick={() => togglePassword(item.id)}
                          className="text-slate-400 transition hover:text-sky-500"
                        >
                          {visiblePasswords[item.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-slate-500">{item.email}</td>
                    <td className="px-3 py-4 text-slate-500">{item.proxy}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-4 text-slate-500">{item.lockedDays}</td>
                    <td className="px-3 py-4 text-slate-500">{item.createdAt}</td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-sky-500 transition hover:scale-110 hover:text-sky-600"
                          title="Xem thông tin"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (item.status === "warning") {
                              handleUnlockAccount(item.id);
                            } else {
                              handleLockAccount(item.id);
                            }
                          }}
                          className="text-sky-500 transition hover:scale-110 hover:text-sky-600"
                          title={item.status === "warning" ? "Mở khóa tài khoản" : "Tạm khóa tài khoản"}
                        >
                          {item.status === "warning" ? (
                            <LockOpen className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(item.id)}
                          className="text-rose-500 transition hover:scale-110 hover:text-rose-600"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pagedAccounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      Không có dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 outline-none"
                >
                  <option value={10}>10</option>
                  <option value={5}>5</option>
                </select>
              </div>

              <span>trên {filteredAccounts.length} kết quả</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages })
                .slice(0, 5)
                .map((_, idx) => {
                  const page = idx + 1;
                  const active = page === currentPage;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-all ${
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddAccountModal
        open={openAddModal}
        form={form}
        onClose={() => {
          setOpenAddModal(false);
          setForm(initialForm);
        }}
        onChange={handleFormChange}
        onSubmit={handleAddAccount}
        isSubmitting={isBlocking}
      />

      <AccountDetailsModal
        open={openDetailsModal}
        account={selectedAccount}
        onClose={() => {
          setOpenDetailsModal(false);
          setSelectedAccount(null);
        }}
      />
    </>
  );
}





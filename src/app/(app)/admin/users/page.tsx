"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Lock,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import DatePicker from "@/components/ui/date-picker";
import { useAppAction } from "@/components/app-action-provider";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserStatus,
  type AdminUserResponse,
} from "@/lib/api-client";

type UserStatus = "active" | "locked";

type UserItem = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  role: "staff";
  status: UserStatus;
  createdAt: string;
  avatar?: string;
};

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "locked", label: "Bị khóa" },
];

function formatDate(date?: Date) {
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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

function mapApiUser(user: AdminUserResponse): UserItem {
  return {
    id: user.id,
    code: user.code,
    name: user.name,
    email: user.email,
    phone: user.phone || "-",
    role: "staff",
    status: user.status === "locked" ? "locked" : "active",
    createdAt: formatDateTime(user.createdAt),
  };
}

function StatCard({
  title,
  value,
  change,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p
            className={`mt-1 text-xs font-semibold ${
              change.startsWith("-") ? "text-rose-500" : "text-emerald-500"
            }`}
          >
            {change}{" "}
            <span className="font-normal text-slate-400">
              so với tháng trước
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map = {
    active: {
      label: "Đang hoạt động",
      className: "bg-emerald-50 text-emerald-600",
    },
    locked: {
      label: "Bị khóa",
      className: "bg-rose-50 text-rose-600",
    },
  };

  return (
    <span
      className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${map[status].className}`}
    >
      {map[status].label}
    </span>
  );
}

function UserDetailModal({
  user,
  status,
  onClose,
}: {
  user: UserItem | null;
  status?: UserStatus;
  onClose: () => void;
}) {
  if (!user) return null;

  const currentStatus = status ?? user.status;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Thông tin người dùng
            </h3>
            <p className="mt-1 text-sm text-slate-500">{user.code}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-lg font-bold text-sky-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Mã người dùng</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.code}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Họ và tên</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.name}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.email}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Số điện thoại</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.phone}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Vai trò</span>
              <span className="rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                Nhân viên
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Trạng thái</span>
              <StatusBadge status={currentStatus} />
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-sm text-slate-500">Ngày tạo</span>
              <span className="text-sm font-semibold text-slate-800">
                {user.createdAt}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="h-11 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { isBlocking, runAction } = useAppAction();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createdDate, setCreatedDate] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editedStatuses, setEditedStatuses] = useState<
    Record<number, UserStatus>
  >({});

  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getAdminUsers()
      .then((items) => {
        if (mounted) setUsers(items.map(mapApiUser));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();
      const currentStatus = editedStatuses[user.id] ?? user.status;

      const matchSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword) ||
        user.code.toLowerCase().includes(keyword);

      const matchStatus = status === "all" || currentStatus === status;

      const matchDate =
        !createdDate || user.createdAt.startsWith(formatDate(createdDate));

      return matchSearch && matchStatus && matchDate;
    });
  }, [users, search, status, editedStatuses, createdDate]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const data = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);

  const handleLockUser = (userId: number) => {
    setEditedStatuses((prev) => ({
      ...prev,
      [userId]: "locked",
    }));
  };

  const handleSaveStatuses = async () => {
    if (!hasEditedStatus || isBlocking) return;

    await runAction(async () => {
      const updatedUsers = await Promise.all(
        Object.entries(editedStatuses).map(([id, nextStatus]) =>
          updateAdminUserStatus(Number(id), nextStatus === "active")
        )
      );
      const byId = new Map(updatedUsers.map((user) => [user.id, mapApiUser(user)]));
      setUsers((prev) => prev.map((user) => byId.get(user.id) ?? user));
      setEditedStatuses({});
    }, {
      loadingMessage: "Đang cập nhật người dùng...",
      successTitle: "Cập nhật thành công",
      successDescription: "Trạng thái người dùng đã được lưu.",
    });
  };

  const handleDeleteUser = async (userId: number) => {
    if (isBlocking) return;

    await runAction(async () => {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }, {
      loadingMessage: "Đang xóa người dùng...",
      successTitle: "Đã xóa người dùng",
      successDescription: "Dữ liệu người dùng đã được xóa khỏi database.",
    });
  };

  const hasEditedStatus = Object.keys(editedStatuses).length > 0;

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900">
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Trang chủ / Quản lý người dùng
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveStatuses}
              disabled={!hasEditedStatus || isBlocking}
              className="inline-flex h-11 items-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>

            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600">
              <Plus className="h-4 w-4" />
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Tổng người dùng"
            value={String(users.length)}
            change="+12.5%"
            icon={<Users className="h-6 w-6 text-sky-500" />}
            iconClass="bg-sky-50"
          />

          <StatCard
            title="Người dùng hoạt động"
            value={String(
              users.filter(
                (u) => (editedStatuses[u.id] ?? u.status) === "active"
              ).length
            )}
            change="+8.3%"
            icon={<UserCheck className="h-6 w-6 text-emerald-500" />}
            iconClass="bg-emerald-50"
          />

          <StatCard
            title="Người dùng mới"
            value="232"
            change="+15.7%"
            icon={<UserPlus className="h-6 w-6 text-orange-500" />}
            iconClass="bg-orange-50"
          />

          <StatCard
            title="Người dùng bị khóa"
            value={String(
              users.filter(
                (u) => (editedStatuses[u.id] ?? u.status) === "locked"
              ).length
            )}
            change="-6.2%"
            icon={<UserX className="h-6 w-6 text-rose-500" />}
            iconClass="bg-rose-50"
          />
        </div>

        <div className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid gap-3 lg:grid-cols-[1.25fr_0.9fr_0.9fr]">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm kiếm người dùng..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] text-slate-400">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                {statusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative z-50">
              <label className="absolute -top-2 left-3 z-10 bg-white px-1 text-[11px] text-slate-400">
                Ngày tạo
              </label>
              <DatePicker
                value={createdDate}
                onChange={(date) => {
                  setCreatedDate(date);
                  setPage(1);
                }}
                placeholder="Chọn ngày"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-white text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">ID</th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Họ và tên
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">Email</th>
                  <th className="px-4 py-4 text-left font-semibold">
                    Số điện thoại
                  </th>
                  <th className="px-4 py-4 text-left font-semibold">Vai trò</th>
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
                {data.map((user) => {
                  const currentStatus = editedStatuses[user.id] ?? user.status;
                  const isEdited = editedStatuses[user.id] !== undefined;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-none hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {user.code}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-sky-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">{user.email}</td>
                      <td className="px-4 py-4 text-slate-600">{user.phone}</td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                          Nhân viên
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={
                            isEdited
                              ? "inline-flex rounded-xl border border-emerald-200 bg-emerald-50 p-1"
                              : ""
                          }
                        >
                          <StatusBadge status={currentStatus} />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {user.createdAt}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-sky-500 transition hover:text-sky-600"
                            title="Xem thông tin người dùng"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleLockUser(user.id)}
                            disabled={currentStatus === "locked"}
                            className="text-amber-500 transition hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Khóa tài khoản"
                          >
                            <Lock className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-rose-500 transition hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}

                {!isLoading && data.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      Không có người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Hiển thị{" "}
              {filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1} đến{" "}
              {Math.min(page * pageSize, filteredUsers.length)} của {filteredUsers.length} người
              dùng
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }).map(
                (_, index) => {
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
                }
              )}

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

      <UserDetailModal
        user={selectedUser}
        status={
          selectedUser
            ? editedStatuses[selectedUser.id] ?? selectedUser.status
            : undefined
        }
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}




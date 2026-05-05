"use client";

import { getAuthSession } from "@/lib/auth-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://order-tracking-be-xuh3.onrender.com/api";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightRequests = new Map<string, Promise<unknown>>();
const CACHE_PREFIX = "shipping_management_api_cache:";
const DEFAULT_TTL_MS = 30_000;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getStorageKey(key: string) {
  return `${CACHE_PREFIX}${key}`;
}

function readCache<T>(key: string): T | null {
  const now = Date.now();
  const memoryValue = memoryCache.get(key);

  if (memoryValue && memoryValue.expiresAt > now) {
    return memoryValue.value as T;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(getStorageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed.expiresAt <= now) {
      sessionStorage.removeItem(getStorageKey(key));
      memoryCache.delete(key);
      return null;
    }

    memoryCache.set(key, parsed);
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(key, entry);

  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore storage quota / serialization issues.
  }
}

export function invalidateApiCache(prefix?: string) {
  const keys = Array.from(memoryCache.keys());
  keys.forEach((key) => {
    if (!prefix || key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  });

  if (typeof window === "undefined") {
    return;
  }

  try {
    const storageKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        storageKeys.push(key);
      }
    }

    storageKeys.forEach((key) => {
      const logicalKey = key.slice(CACHE_PREFIX.length);
      if (!prefix || logicalKey.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage access issues.
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const session = getAuthSession();
    if (!session?.token) {
      throw new ApiError("Bạn chưa đăng nhập.", 401);
    }
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : null) ??
      (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : null) ??
      "Đã có lỗi xảy ra.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

async function cachedGet<T>(
  cacheKey: string,
  path: string,
  options: ApiFetchOptions = {},
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const cached = readCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const inflightKey = `${options.auth ? "auth:" : ""}${cacheKey}`;
  const inflight = inflightRequests.get(inflightKey);
  if (inflight) {
    return inflight as Promise<T>;
  }

  const request = apiFetch<T>(path, options)
    .then((result) => {
      writeCache(cacheKey, result, ttlMs);
      return result;
    })
    .finally(() => {
      inflightRequests.delete(inflightKey);
    });

  inflightRequests.set(inflightKey, request);
  return request;
}

export type AuthResponse = {
  token: string;
  tokenType: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

export type UserProfileResponse = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  referralCode?: string | null;
  role: string;
};

export type ReferralCommissionHistoryResponse = {
  type: string;
  commissionAmount: number;
  orderAmount: number;
  sourceUser: string;
  sourceUsername: string;
  trackingCode: string;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  createdAt: string;
};

export type UserWithdrawalResponse = {
  id: number;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type AdminWithdrawalResponse = {
  id: number;
  userId: number;
  username: string;
  fullName?: string | null;
  email: string;
  amount: number;
  bankName: string;
  bankAccountNumber: string;
  status: "pending" | "approved" | "rejected";
  note?: string | null;
  createdAt: string;
};

export type UserReferralSummaryResponse = {
  referralCode: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  directReferralCount: number;
  transactionCount: number;
  totalCommission: number;
  pendingCommission: number;
  coinBalance: number;
  withdrawableCoins: number;
  pendingWithdrawal: number;
  withdrawnCoins: number;
  history: ReferralCommissionHistoryResponse[];
  withdrawals: UserWithdrawalResponse[];
};

export type UserOrder = {
  id: number;
  trackingCode: string;
  amount: number;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  createdAt: string;
  proofImageUrl?: string | null;
};

export type UserOrderDetail = UserOrder & {
  history: Array<{
    createdAt: string;
    message: string;
  }>;
};

export type UserDashboardResponse = {
  totalOrders: number;
  shippingOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentActivities: string[];
  recentOrders: UserOrder[];
};

export type UserStatsResponse = {
  totalOrders: number;
  completedOrders: number;
  shippingOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyOrders: Array<{
    month: string;
    orders: number;
  }>;
};

export type AdminMetricCardResponse = {
  title: string;
  value: string;
  note: string;
};

export type AdminMonthlyRevenueResponse = {
  month: string;
  year: string;
  revenue: number;
  orders: number;
};

export type AdminTopCustomerResponse = {
  id: number;
  name: string;
  email: string;
  orderCount: number;
  totalAmount: number;
};

export type AdminRecentOrderResponse = {
  id: number;
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  createdAt: string;
};

export type AdminDashboardResponse = {
  metrics: AdminMetricCardResponse[];
  monthlyRevenue: AdminMonthlyRevenueResponse[];
  availableYears: string[];
  topCustomers: AdminTopCustomerResponse[];
  recentOrders: AdminRecentOrderResponse[];
};

export type AdminOrderStatusBreakdownResponse = {
  name: string;
  value: number;
};

export type AdminUserRoleBreakdownResponse = {
  role: string;
  value: number;
};

export type AdminStatsResponse = {
  metrics: AdminMetricCardResponse[];
  monthlyRevenue: AdminMonthlyRevenueResponse[];
  orderStatusBreakdown: AdminOrderStatusBreakdownResponse[];
  userRoleBreakdown: AdminUserRoleBreakdownResponse[];
  topCustomers: AdminTopCustomerResponse[];
};

export type TaskResponse = {
  id: number;
  title: string;
  howToBuy: string;
  productLink?: string | null;
  liveLink?: string | null;
  finalPrice: string;
  address: string;
  sampleImage?: string | null;
  sampleLabel: string;
  sampleHint: string;
  accent: string;
  active: boolean;
  createdAt: string;
};

export type TaskPayload = {
  title: string;
  howToBuy: string;
  productLink?: string | null;
  liveLink?: string | null;
  finalPrice: string;
  address: string;
  sampleImage?: string | null;
  sampleLabel: string;
  sampleHint: string;
  accent: string;
  active: boolean;
};

export type OtpResponse = {
  message: string;
  email: string;
  purpose: string;
  expiresAt: string;
  otpPreview?: string | null;
};

export async function login(payload: { username: string; password: string }) {
  invalidateApiCache();
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendRegisterOtp(email: string) {
  return apiFetch<OtpResponse>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      purpose: "REGISTER",
    }),
  });
}

export async function verifyRegisterOtp(email: string, code: string) {
  return apiFetch<{ message: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
      purpose: "REGISTER",
    }),
  });
}

export async function register(payload: {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}) {
  invalidateApiCache();
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return cachedGet<UserProfileResponse>("auth/me", "/auth/me", { auth: true }, 60_000);
}

export async function updateCurrentUser(payload: {
  fullName: string;
  phone: string;
  bankName: string;
  bankAccountNumber: string;
}) {
  const result = await apiFetch<UserProfileResponse>("/auth/me", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
  invalidateApiCache("auth/me");
  writeCache("auth/me", result, 60_000);
  return result;
}

export async function getUserDashboard() {
  return cachedGet<UserDashboardResponse>("user/dashboard", "/user/dashboard", { auth: true }, 20_000);
}

export async function getUserStats() {
  return cachedGet<UserStatsResponse>("user/stats", "/user/stats", { auth: true }, 20_000);
}

export async function getUserReferralSummary() {
  return cachedGet<UserReferralSummaryResponse>("user/commissions", "/user/commissions", { auth: true }, 20_000);
}

export async function createWithdrawalRequest(payload: { amount: number }) {
  const result = await apiFetch<UserReferralSummaryResponse>("/user/commissions/withdrawals", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
  invalidateApiCache("user/commissions");
  writeCache("user/commissions", result, 20_000);
  return result;
}

export async function getAdminDashboard() {
  return cachedGet<AdminDashboardResponse>("admin/dashboard", "/admin/dashboard", { auth: true }, 20_000);
}

export async function getAdminStats() {
  return cachedGet<AdminStatsResponse>("admin/stats", "/admin/stats", { auth: true }, 20_000);
}

export async function getAdminWithdrawals() {
  return cachedGet<AdminWithdrawalResponse[]>("admin/withdrawals", "/admin/withdrawals", { auth: true }, 15_000);
}

export async function getUserOrders() {
  return cachedGet<UserOrder[]>("user/orders", "/user/orders", { auth: true }, 15_000);
}

export async function createUserOrder(payload: { trackingCode: string; amount?: number }) {
  const result = await apiFetch<UserOrder>("/user/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
  invalidateApiCache("user/orders");
  invalidateApiCache("user/dashboard");
  invalidateApiCache("user/stats");
  return result;
}

export async function trackUserOrder(trackingCode: string) {
  return apiFetch<UserOrderDetail>(
    `/user/orders/track?trackingCode=${encodeURIComponent(trackingCode)}`,
    { auth: true }
  );
}

export async function getTaskPosts() {
  return cachedGet<TaskResponse[]>("tasks", "/tasks", { auth: true }, 60_000);
}

export async function getAdminTaskPosts() {
  return apiFetch<TaskResponse[]>("/tasks/admin", { auth: true });
}

export async function createTaskPost(payload: TaskPayload) {
  const result = await apiFetch<TaskResponse>("/tasks", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
  invalidateApiCache("tasks");
  return result;
}

export async function deleteTaskPost(id: number) {
  await apiFetch<void>(`/tasks/${id}`, {
    method: "DELETE",
    auth: true,
  });
  invalidateApiCache("tasks");
}

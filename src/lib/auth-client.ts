export type UserRole = "admin" | "user";

export type AuthSession = {
  isLoggedIn: boolean;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  token: string;
};

const AUTH_STORAGE_KEY = "shipping_management_auth";
const PENDING_REGISTER_STORAGE_KEY = "shipping_management_pending_register";

export function normalizeUserRole(role: unknown): UserRole {
  const normalized = String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/^role[_-]/, "");

  return normalized === "admin" ? "admin" : "user";
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      ...session,
      role: normalizeUserRole(session.role),
      isLoggedIn: Boolean(session.isLoggedIn && session.token),
    })
  );
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession> & { role?: unknown };
    if (!parsed.token) return null;

    const session: AuthSession = {
      isLoggedIn: Boolean((parsed.isLoggedIn ?? true) && parsed.token),
      role: normalizeUserRole(parsed.role),
      name: parsed.name ?? parsed.username ?? "",
      username: parsed.username ?? "",
      email: parsed.email ?? "",
      token: parsed.token,
    };

    if (parsed.role !== session.role || parsed.isLoggedIn !== session.isLoggedIn) {
      saveAuthSession(session);
    }

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export type PendingRegisterSession = {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export function savePendingRegisterSession(session: PendingRegisterSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_REGISTER_STORAGE_KEY, JSON.stringify(session));
}

export function getPendingRegisterSession(): PendingRegisterSession | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PENDING_REGISTER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingRegisterSession;
  } catch {
    return null;
  }
}

export function clearPendingRegisterSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_REGISTER_STORAGE_KEY);
}

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Globe, PackageCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthDesktopLayoutProps = {
  children: ReactNode;
  compact?: boolean;
};

export function AuthHeader() {
  return (
    <div className="flex h-[68px] items-center justify-between border-b border-sky-100 bg-white px-5 md:px-8">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
          <PackageCheck className="h-6 w-6" />
        </div>
        <div className="leading-none">
          <div className="text-[15px] font-bold tracking-tight text-sky-600 md:text-[18px]">
            QUANLYVANDON
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-400 md:text-[10px]">
            HỆ THỐNG QUẢN LÝ VẬN ĐƠN
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <button type="button" className="hidden items-center gap-2 text-sm font-medium text-sky-600 md:flex">
          <Globe className="h-4 w-4" />
          Vietnamese
        </button>
        <ThemeToggle variant="inline" className="rounded-full" />
      </div>
    </div>
  );
}

export function AuthFooter({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`text-center text-sm text-slate-400 ${compact ? "mt-7" : "mt-8"}`}>
      © 2024 QUANLYVANDON.VN. All rights reserved.
      <div className="mt-3 flex items-center justify-center gap-4 text-[13px]">
        <span>Chính sách bảo mật</span>
        <span>|</span>
        <span>Điều khoản sử dụng</span>
        <span>|</span>
        <span>Liên hệ hỗ trợ</span>
      </div>
    </div>
  );
}

export function AuthDesktopLayout({
  children,
  compact = false,
}: AuthDesktopLayoutProps) {
  return (
    <div className="hidden min-h-screen bg-[#eef7fd] px-3 py-3 transition-colors duration-300 dark:bg-slate-950 lg:block">
      <div className={`mx-auto rounded-[10px] border border-sky-100 bg-[#f7fbff] shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 ${compact ? "max-w-[980px]" : "max-w-[1360px]"}`}>
        <AuthHeader />
        <div className="px-7 py-5">{children}</div>
      </div>
    </div>
  );
}

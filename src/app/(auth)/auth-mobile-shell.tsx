"use client";

import { ArrowLeft, PackageCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthMobileShellProps = {
  children: React.ReactNode;
  onBack: () => void;
};

export function AuthMobileShell({
  children,
  onBack,
}: AuthMobileShellProps) {
  return (
    <div className="min-h-screen bg-[#f8fbff] transition-colors duration-300 dark:bg-slate-950 lg:hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
              <PackageCheck className="h-6 w-6" />
            </div>
            <span className="mt-2 text-[15px] font-bold text-sky-600">
              QUANLYVANDON
            </span>
          </div>

          <ThemeToggle variant="inline" className="h-10 w-10 rounded-full" />
        </div>

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(148,163,184,0.14)] transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
          <div className="px-6 py-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

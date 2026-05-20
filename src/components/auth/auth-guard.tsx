"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth-client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (!session?.isLoggedIn) {
      setIsReady(false);
      router.replace("/login");
      return;
    }

    if (pathname.startsWith("/admin") && session.role !== "admin") {
      setIsReady(false);
      router.replace("/user/home");
      return;
    }

    if (pathname.startsWith("/user") && session.role !== "user") {
      setIsReady(false);
      router.replace("/admin/dashboard");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] text-sm text-slate-500">
        Đang tải...
      </div>
    );
  }

  return <>{children}</>;
}

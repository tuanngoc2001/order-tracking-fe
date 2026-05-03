"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AppActionOptions = {
  loadingMessage?: string;
  successTitle?: string;
  successDescription?: ReactNode;
  errorTitle?: string;
  errorDescription?: ReactNode;
  minLoadingMs?: number;
};

type AppActionContextValue = {
  isBlocking: boolean;
  beginBlocking: (message?: string) => () => void;
  runAction: <T>(
    action: () => T | Promise<T>,
    options?: AppActionOptions
  ) => Promise<T | undefined>;
};

const AppActionContext = createContext<AppActionContextValue | null>(null);
const ROUTE_TRANSITION_SENTINEL = "__route_transition__";

export function AppActionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState("Đang xử lý...");
  const blockersRef = useRef(new Map<number, string>());
  const blockerIdRef = useRef(0);

  const syncBlockingState = useCallback(() => {
    const entries = Array.from(blockersRef.current.values());
    setPendingCount(entries.length);
    setMessage(entries[entries.length - 1] ?? "Đang xử lý...");
  }, []);

  const beginBlocking = useCallback(
    (nextMessage = "Đang xử lý...") => {
      blockerIdRef.current += 1;
      const id = blockerIdRef.current;
      blockersRef.current.set(id, nextMessage);
      syncBlockingState();

      return () => {
        if (!blockersRef.current.has(id)) return;
        blockersRef.current.delete(id);
        syncBlockingState();
      };
    },
    [syncBlockingState]
  );

  useEffect(() => {
    blockersRef.current.forEach((value, key) => {
      if (value === ROUTE_TRANSITION_SENTINEL) {
        blockersRef.current.delete(key);
      }
    });
    syncBlockingState();
  }, [pathname, syncBlockingState]);

  const runAction = useCallback(
    async <T,>(
      action: () => T | Promise<T>,
      options: AppActionOptions = {}
    ) => {
      const release = beginBlocking(options.loadingMessage ?? "Đang xử lý...");

      try {
        const result = await action();

        if (options.successTitle) {
          toast({
            title: options.successTitle,
            description: options.successDescription,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : undefined;

        toast({
          title: options.errorTitle ?? "Thao tác thất bại",
          description:
            options.errorDescription ??
            errorMessage ??
            "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
          variant: "destructive",
        });

        return undefined;
      } finally {
        release();
      }
    },
    [beginBlocking, toast]
  );

  const value = useMemo(
    () => ({
      isBlocking: pendingCount > 0,
      beginBlocking,
      runAction,
    }),
    [beginBlocking, pendingCount, runAction]
  );

  return (
    <AppActionContext.Provider value={value}>
      {children}

      {pendingCount > 0 && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
            {message === ROUTE_TRANSITION_SENTINEL ? "Đang tải trang..." : message}
          </div>
        </div>
      )}
    </AppActionContext.Provider>
  );
}

export function useAppAction() {
  const context = useContext(AppActionContext);

  if (!context) {
    throw new Error("useAppAction must be used inside AppActionProvider");
  }

  return context;
}

export { ROUTE_TRANSITION_SENTINEL };

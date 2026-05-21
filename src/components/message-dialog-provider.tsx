"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MessageDialogOptions = {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  variant?: "info" | "error";
  code?: string;
  onConfirm?: () => void;
};

type MessageDialogContextValue = {
  showMessageDialog: (message: ReactNode | MessageDialogOptions) => void;
  showErrorDialog: (message: ReactNode | Omit<MessageDialogOptions, "variant">) => void;
  closeMessageDialog: () => void;
};

const MessageDialogContext = createContext<MessageDialogContextValue | null>(null);

export function MessageDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<MessageDialogOptions | null>(null);

  const closeMessageDialog = useCallback(() => {
    setDialog(null);
  }, []);

  const showMessageDialog = useCallback((message: ReactNode | MessageDialogOptions) => {
    setDialog(
      typeof message === "object" && message !== null && "message" in message
        ? message
        : { message, variant: "info" }
    );
  }, []);

  const showErrorDialog = useCallback((message: ReactNode | Omit<MessageDialogOptions, "variant">) => {
    setDialog(
      typeof message === "object" && message !== null && "message" in message
        ? { ...message, variant: "error" }
        : { message, variant: "error" }
    );
  }, []);

  const value = useMemo(
    () => ({
      showMessageDialog,
      showErrorDialog,
      closeMessageDialog,
    }),
    [closeMessageDialog, showErrorDialog, showMessageDialog]
  );

  const isError = dialog?.variant === "error";

  const handleConfirm = useCallback(() => {
    const onConfirm = dialog?.onConfirm;
    setDialog(null);
    onConfirm?.();
  }, [dialog]);

  return (
    <MessageDialogContext.Provider value={value}>
      {children}

      {dialog && (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-slate-950/25 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-2xl">
            <div className="bg-sky-500 px-5 py-3 text-sm font-bold text-white">
              {dialog.title ?? (isError ? "Error" : "Info")}
            </div>
            <div className="p-5">
              <div
                className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                  isError ? "bg-rose-50 text-rose-500" : "bg-sky-50 text-sky-500"
                }`}
              >
                {isError ? "!" : "i"}
              </div>
              <div className="mt-2 text-sm font-medium text-slate-600">
                {dialog.message}
              </div>
              {dialog.code ? (
                <div className="mt-3 text-right text-xs font-semibold text-slate-400">
                  {dialog.code.replace(/^msg/i, "Msg")}
                </div>
              ) : null}
              <button
                onClick={handleConfirm}
                className="mt-5 inline-flex h-10 min-w-24 items-center justify-center rounded-lg bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                {dialog.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MessageDialogContext.Provider>
  );
}

export function useMessageDialog() {
  const context = useContext(MessageDialogContext);

  if (!context) {
    throw new Error("useMessageDialog must be used inside MessageDialogProvider");
  }

  return context;
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef, useState } from "react";
import { useAppAction } from "@/components/app-action-provider";
import { useMessageDialog } from "@/components/message-dialog-provider";
import { AuthDesktopLayout, AuthFooter } from "@/components/auth/auth-desktop-layout";
import { register as registerRequest, sendRegisterOtp, verifyRegisterOtp } from "@/lib/api-client";
import {
  clearPendingRegisterSession,
  getPendingRegisterSession,
  normalizeUserRole,
  saveAuthSession,
} from "@/lib/auth-client";
import { AuthMobileShell } from "../auth-mobile-shell";

function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { runAction } = useAppAction();
  const { showMessageDialog } = useMessageDialog();
  const email = searchParams.get("email") || "";
  const mode = searchParams.get("mode") || "register";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const maskedEmail = useMemo(() => {
    if (!email || !email.includes("@")) return "email của bạn";
    const [name, domain] = email.split("@");
    const shortName = name.length <= 2 ? name : `${name.slice(0, 2)}***${name.slice(-1)}`;
    return `${shortName}@${domain}`;
  }, [email]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 1);
    const nextOtp = [...otp];
    nextOtp[index] = cleanValue;
    setOtp(nextOtp);
    setError("");
    if (cleanValue && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.some((item) => !item.trim())) {
      setError("Vui lòng nhập đầy đủ mã OTP.");
      return;
    }

    setIsSubmitting(true);
    await runAction(
      async () => {
        const otpValue = otp.join("");
        if (mode === "register") {
          const pending = getPendingRegisterSession();
          if (!pending || pending.email !== email) {
            throw new Error("Không tìm thấy phiên đăng ký tạm.");
          }

          await verifyRegisterOtp(email, otpValue);
          const response = await registerRequest({
            username: pending.username,
            fullName: pending.fullName,
            email: pending.email,
            phone: pending.phone,
            password: pending.password,
          });

          clearPendingRegisterSession();
          saveAuthSession({
            isLoggedIn: true,
            role: normalizeUserRole(response.role),
            name: response.fullName || response.username,
            username: response.username,
            email: response.email,
            token: response.token,
          });
          showMessageDialog({
            message: "Đăng ký thành công",
            code: "msg_2",
            onConfirm: () => router.push("/user/home"),
          });
          return;
        }

        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      },
      {
        loadingMessage: "Đang xác thực OTP...",
        errorTitle: "Xác thực OTP thất bại",
      }
    );
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    await runAction(
      async () => {
        const response = await sendRegisterOtp(email);
        if (response.otpPreview) {
          console.info("DEV OTP:", response.otpPreview);
        }
      },
      {
        loadingMessage: "Đang gửi lại OTP...",
        successTitle: "Đã gửi lại OTP",
        successDescription: "Vui lòng kiểm tra email để tiếp tục.",
        errorTitle: "Không thể gửi lại OTP",
      }
    );
    setIsResending(false);
  };

  const otpInputs = (
    <div className="flex items-center justify-center gap-[9px]">
      {otp.map((item, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={item}
          onChange={(event) => handleOtpChange(index, event.target.value)}
          inputMode="numeric"
          maxLength={1}
          className="h-[44px] w-[44px] rounded-[8px] border border-[#dbe5f0] bg-white text-center text-[18px] font-semibold text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      ))}
    </div>
  );

  const form = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {otpInputs}

      {error ? <p className="text-center text-[13px] text-red-500">{error}</p> : null}

      <div className="space-y-1.5 text-center text-[13px] leading-6 text-slate-500">
        <p>
          Mã xác thực có hiệu lực trong <span className="font-semibold text-sky-500">5:00</span>
        </p>
        <p>
          Chưa nhận được mã?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-sky-500 hover:text-sky-600"
          >
            {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
          </button>
          {!isResending ? <span className="text-slate-400"> (52s)</span> : null}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-[40px] w-full rounded-[7px] bg-[#1296ea] text-[14px] font-semibold text-white transition hover:bg-[#0d86d3] disabled:opacity-70"
      >
        {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
      </button>
    </form>
  );

  return (
    <>
      <AuthDesktopLayout compact>
        <div className="flex min-h-[430px] items-start justify-center pt-8">
          <div className="w-full max-w-[332px] rounded-[12px] border border-[#dbe5f0] bg-white px-8 pb-8 pt-9 text-center shadow-[0_8px_20px_rgba(148,163,184,0.10)]">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-5 text-[13px] font-medium text-sky-500 hover:text-sky-600"
            >
              ← Quay lại
            </button>

            <h1 className="text-[20px] font-bold leading-tight text-slate-900">
              Xác thực mã OTP
            </h1>
            <p className="mt-4 text-[13px] leading-6 text-slate-500">
              Chúng tôi đã gửi mã xác thực tới địa chỉ
              <br />
              email: <span className="font-semibold text-sky-500">{maskedEmail}</span>
            </p>

            <div className="mt-8">{form}</div>
          </div>
        </div>
        <AuthFooter compact />
      </AuthDesktopLayout>

      <AuthMobileShell onBack={() => router.back()}>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-[13px] font-medium text-sky-500 hover:text-sky-600"
          >
            ← Quay lại
          </button>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900">
            Xác thực mã OTP
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-slate-500">
            Chúng tôi đã gửi mã xác thực tới địa chỉ
            <br />
            email: <span className="font-semibold text-sky-500">{maskedEmail}</span>
          </p>
        </div>
        {form}
      </AuthMobileShell>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Đang tải...</div>}>
      <VerifyOtpPageContent />
    </Suspense>
  );
}

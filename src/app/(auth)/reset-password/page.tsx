"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { AuthDesktopLayout, AuthFooter } from "@/components/auth/auth-desktop-layout";
import { ResetIllustration } from "@/components/auth/auth-visuals";
import { AuthMobileShell } from "../auth-mobile-shell";

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

const initialFormData: ResetPasswordFormData = {
  password: "",
  confirmPassword: "",
};

function ResetPasswordPageContent() {
  const router = useRouter();
  const { runAction } = useAppAction();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState<ResetPasswordFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange =
    (field: keyof ResetPasswordFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!formData.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu mới.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu.";
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleResetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await runAction(
      async () => {
        console.log("RESET_PASSWORD_SUBMIT", { email, password: formData.password });
        router.push("/login");
      },
      {
        loadingMessage: "Đang đặt lại mật khẩu...",
        successTitle: "Đặt lại mật khẩu thành công",
        successDescription: "Bạn có thể đăng nhập bằng mật khẩu mới.",
        errorTitle: "Không thể đặt lại mật khẩu",
      }
    );
    setIsSubmitting(false);
  };

  const renderError = (field: keyof ResetPasswordFormData) =>
    errors[field] ? <p className="mt-2 text-sm text-red-500">{errors[field]}</p> : null;

  const desktopInputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const mobileInputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const desktopForm = (
    <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Nhập mật khẩu mới"
            className={desktopInputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {renderError("password")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder="Nhập lại mật khẩu mới"
            className={desktopInputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {renderError("confirmPassword")}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );

  const mobileForm = (
    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Nhập mật khẩu mới"
            className={mobileInputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {renderError("password")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder="Nhập lại mật khẩu mới"
            className={mobileInputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {renderError("confirmPassword")}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-xl bg-sky-500 text-[15px] font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );

  return (
    <>
      <AuthDesktopLayout>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="flex justify-center">
            <div className="w-full max-w-[320px] rounded-[18px] border border-slate-200 bg-white px-7 py-8 text-center shadow-sm">
              <button type="button" onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)} className="mb-5 text-sm font-medium text-sky-500">
                ← Quay lại
              </button>
              <ResetIllustration />
            </div>
          </div>

          <div className="hidden h-12 w-12 items-center justify-center text-sky-400 lg:flex">
            <span className="text-4xl">›</span>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-[320px] rounded-[18px] border border-slate-200 bg-white px-7 py-8 text-center shadow-sm">
              <h1 className="text-[28px] font-bold leading-tight text-slate-900">Đặt lại mật khẩu mới</h1>
              <p className="mt-3 text-[14px] leading-6 text-slate-500">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
              <div className="mt-8 text-left">{desktopForm}</div>
            </div>
          </div>
        </div>
        <AuthFooter />
      </AuthDesktopLayout>

      <AuthMobileShell onBack={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}>
        <div className="mb-6">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900">Mật khẩu mới</h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">
            Nhập mật khẩu mới để hoàn tất khôi phục tài khoản
          </p>
        </div>
        {mobileForm}
      </AuthMobileShell>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Đang tải...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

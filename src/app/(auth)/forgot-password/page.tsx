"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { AuthDesktopLayout, AuthFooter } from "@/components/auth/auth-desktop-layout";
import { FeatureItem, ForgotIllustration } from "@/components/auth/auth-visuals";
import { AuthMobileShell } from "../auth-mobile-shell";

type ForgotPasswordFormData = {
  email: string;
};

type FormErrors = Partial<Record<keyof ForgotPasswordFormData, string>>;

const initialFormData: ForgotPasswordFormData = {
  email: "",
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { runAction } = useAppAction();
  const [formData, setFormData] = useState<ForgotPasswordFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange =
    (field: keyof ForgotPasswordFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!formData.email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Email không hợp lệ.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await runAction(
      async () => {
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      },
      {
        loadingMessage: "Đang gửi mã OTP...",
        successTitle: "Đã gửi mã OTP",
        successDescription: "Vui lòng kiểm tra email để tiếp tục.",
        errorTitle: "Không thể gửi mã OTP",
      }
    );
    setIsSubmitting(false);
  };

  const renderError = (field: keyof ForgotPasswordFormData) =>
    errors[field] ? <p className="mt-2 text-sm text-red-500">{errors[field]}</p> : null;

  const desktopInputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const mobileInputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const desktopForm = (
    <form onSubmit={handleForgotPasswordSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Nhập email của bạn"
            className={desktopInputClass}
          />
        </div>
        {renderError("email")}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi mã xác thực"}
      </button>
    </form>
  );

  const mobileForm = (
    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={formData.email}
            onChange={handleInputChange("email")}
            placeholder="Nhập email của bạn"
            className={mobileInputClass}
          />
        </div>
        {renderError("email")}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-xl bg-sky-500 text-[15px] font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi mã xác thực"}
      </button>
    </form>
  );

  return (
    <>
      <AuthDesktopLayout>
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[18px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
            <h1 className="text-[28px] font-bold leading-tight text-slate-900">Quên mật khẩu</h1>
            <p className="mt-3 max-w-[430px] text-[15px] leading-7 text-slate-600">
              Nhập email tài khoản của bạn để nhận mã xác thực đặt lại mật khẩu.
            </p>
            <ForgotIllustration />
            <div className="mt-4 space-y-5">
              <FeatureItem
                icon={<Mail className="h-5 w-5" />}
                title="Gửi mã xác thực nhanh"
                description="OTP sẽ được gửi về email đăng ký của bạn trong vài giây."
              />
              <FeatureItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Bảo mật tài khoản"
                description="Chỉ người có quyền truy cập email mới có thể đặt lại mật khẩu."
              />
              <FeatureItem
                icon={<ArrowRight className="h-5 w-5" />}
                title="Khôi phục đơn giản"
                description="Xác thực OTP rồi nhập mật khẩu mới để tiếp tục đăng nhập."
              />
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-slate-900">Quên mật khẩu</h2>
            <p className="mt-1 text-sm text-slate-400">Nhập email tài khoản của bạn để nhận mã xác thực đặt lại mật khẩu.</p>
            {desktopForm}
          </div>
        </div>
        <AuthFooter />
      </AuthDesktopLayout>

      <AuthMobileShell onBack={() => router.push("/login")}>
        <div className="mb-6">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900">Quên mật khẩu</h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">
            Nhập email để nhận mã xác thực đặt lại mật khẩu
          </p>
        </div>
        {mobileForm}
      </AuthMobileShell>
    </>
  );
}

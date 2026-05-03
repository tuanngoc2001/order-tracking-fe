"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { AuthDesktopLayout, AuthFooter } from "@/components/auth/auth-desktop-layout";
import {
  facebookIcon,
  FeatureItem,
  googleIcon,
  LoginIllustration,
  loginFeatures,
  SocialButton,
} from "@/components/auth/auth-visuals";
import { login as loginRequest } from "@/lib/api-client";
import { saveAuthSession } from "@/lib/auth-client";
import { AuthMobileShell } from "../auth-mobile-shell";

type LoginFormData = {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
};

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

const initialFormData: LoginFormData = {
  emailOrUsername: "",
  password: "",
  rememberMe: false,
};

export default function LoginPage() {
  const router = useRouter();
  const { runAction } = useAppAction();
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange =
    (field: keyof LoginFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "rememberMe" ? event.target.checked : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!formData.emailOrUsername.trim()) {
      nextErrors.emailOrUsername = "Vui lòng nhập email hoặc tên đăng nhập.";
    }
    if (!formData.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await runAction(
      async () => {
        const response = await loginRequest({
          username: formData.emailOrUsername.trim(),
          password: formData.password,
        });

        const session = {
          isLoggedIn: true,
          role: response.role.toLowerCase() === "admin" ? "admin" : "user",
          name: response.fullName || response.username,
          username: response.username,
          email: response.email,
          token: response.token,
        } as const;

        saveAuthSession(session);
        router.push(session.role === "admin" ? "/admin/dashboard" : "/user/home");
      },
      {
        loadingMessage: "Đang đăng nhập...",
        successTitle: "Đăng nhập thành công",
        successDescription: "Đang chuyển đến trang làm việc.",
        errorTitle: "Đăng nhập thất bại",
      }
    );
    setIsSubmitting(false);
  };

  const renderError = (field: keyof LoginFormData) =>
    errors[field] ? <p className="mt-2 text-sm text-red-500">{errors[field]}</p> : null;

  const desktopInputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const mobileInputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const forgotLink = (
    <button
      type="button"
      onClick={() => router.push("/forgot-password")}
      className="font-medium text-sky-500 transition hover:text-sky-600"
    >
      Quên mật khẩu?
    </button>
  );

  const desktopForm = (
    <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email hoặc tên đăng nhập</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={formData.emailOrUsername}
            onChange={handleInputChange("emailOrUsername")}
            placeholder="Nhập email hoặc tên đăng nhập"
            className={desktopInputClass}
          />
        </div>
        {renderError("emailOrUsername")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Nhập mật khẩu"
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

      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange("rememberMe")}
            className="h-4 w-4 rounded border-slate-300"
          />
          Ghi nhớ đăng nhập
        </label>
        {forgotLink}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </button>

      <div className="flex items-center gap-4 py-1 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>hoặc đăng nhập với</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2.5">
        <SocialButton icon={googleIcon} label="Đăng nhập với Google" />
        <SocialButton icon={facebookIcon} label="Đăng nhập với Facebook" />
      </div>

      <div className="pt-1 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <button type="button" onClick={() => router.push("/register")} className="font-semibold text-sky-600">
          Đăng ký ngay
        </button>
      </div>
    </form>
  );

  const mobileForm = (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email hoặc tên đăng nhập</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={formData.emailOrUsername}
            onChange={handleInputChange("emailOrUsername")}
            placeholder="Nhập email hoặc tên đăng nhập"
            className={mobileInputClass}
          />
        </div>
        {renderError("emailOrUsername")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            placeholder="Nhập mật khẩu"
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

      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange("rememberMe")}
            className="h-4 w-4 rounded border-slate-300"
          />
          Ghi nhớ đăng nhập
        </label>
        {forgotLink}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-xl bg-sky-500 text-[15px] font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </button>

      <div className="flex items-center gap-4 py-1 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>hoặc đăng nhập với</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2.5">
        <SocialButton icon={googleIcon} label="Đăng nhập với Google" />
        <SocialButton icon={facebookIcon} label="Đăng nhập với Facebook" />
      </div>

      <div className="pt-1 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <button type="button" onClick={() => router.push("/register")} className="font-semibold text-sky-600">
          Đăng ký ngay
        </button>
      </div>
    </form>
  );

  return (
    <>
      <AuthDesktopLayout compact>
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[18px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
            <h1 className="text-[28px] font-bold leading-tight text-slate-900">
              Chào mừng bạn <span className="text-sky-500">trở lại!</span>
            </h1>
            <p className="mt-3 max-w-[430px] text-[15px] leading-7 text-slate-600">
              Đăng nhập để tiếp tục quản lý đơn hàng và theo dõi hoạt động của bạn.
            </p>
            <LoginIllustration />
            <div className="mt-4 space-y-5">
              {loginFeatures.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-slate-900">Đăng nhập</h2>
            <p className="mt-1 text-sm text-slate-400">Nhập thông tin đăng nhập của bạn</p>
            {desktopForm}
          </div>
        </div>
        <AuthFooter compact />
      </AuthDesktopLayout>

      <AuthMobileShell onBack={() => router.back()}>
        <div className="mb-6">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900">Đăng nhập</h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">
            Nhập thông tin đăng nhập của bạn
          </p>
        </div>
        {mobileForm}
      </AuthMobileShell>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Phone, User, Users } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { useMessageDialog } from "@/components/message-dialog-provider";
import { AuthDesktopLayout, AuthFooter } from "@/components/auth/auth-desktop-layout";
import {
  FeatureItem,
  RegisterIllustration,
  registerFeatures,
} from "@/components/auth/auth-visuals";
import { register as registerRequest } from "@/lib/api-client";
import { AuthMobileShell } from "../auth-mobile-shell";

type RegisterFormData = {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  acceptTerms: boolean;
};

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

const initialFormData: RegisterFormData = {
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  referralCode: "",
  acceptTerms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const { runAction } = useAppAction();
  const { showMessageDialog } = useMessageDialog();
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const referralCode = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (!referralCode) {
      return;
    }

    setFormData((prev) => (prev.referralCode === referralCode ? prev : { ...prev, referralCode }));
  }, []);

  const handleInputChange =
    (field: keyof RegisterFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === "acceptTerms" ? event.target.checked : event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!formData.username.trim()) nextErrors.username = "Vui long nhap username.";
    if (!formData.email.trim()) nextErrors.email = "Vui lòng nhập email.";
    if (!formData.phone.trim()) nextErrors.phone = "Vui lòng nhập số điện thoại.";
    if (!formData.password.trim()) nextErrors.password = "Vui lòng nhập mật khẩu.";
    if (formData.password.trim().length < 6) nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }
    if (!formData.acceptTerms) nextErrors.acceptTerms = "Bạn cần đồng ý điều khoản sử dụng.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await runAction(
      async () => {
        const username = formData.username.trim();
        await registerRequest({
          username,
          fullName: username,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          referralCode: formData.referralCode.trim() || undefined,
        });

        showMessageDialog({
          message: "Đăng ký thành công",
          code: "msg_2",
          onConfirm: () => router.push("/login"),
        });
      },
      {
        loadingMessage: "Đang đăng ký...",
        errorTitle: "Đăng ký thất bại",
      }
    );
    setIsSubmitting(false);
  };

  const renderError = (field: keyof RegisterFormData) =>
    errors[field] ? <p className="mt-2 text-sm text-red-500">{errors[field]}</p> : null;

  const desktopInputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const mobileInputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";

  const desktopForm = (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.username} onChange={handleInputChange("username")} placeholder="Nhập username" className={desktopInputClass} />
        </div>
        {renderError("username")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.email} onChange={handleInputChange("email")} placeholder="Nhập email của bạn" className={desktopInputClass} />
        </div>
        {renderError("email")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.phone} onChange={handleInputChange("phone")} placeholder="Nhập số điện thoại" className={desktopInputClass} />
        </div>
        {renderError("phone")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="password" value={formData.password} onChange={handleInputChange("password")} placeholder="Nhập mật khẩu" className={desktopInputClass} />
        </div>
        {renderError("password")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder="Nhập lại mật khẩu"
            className={desktopInputClass}
          />
        </div>
        {renderError("confirmPassword")}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã giới thiệu</label>
        <div className="relative">
          <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.referralCode} onChange={handleInputChange("referralCode")} placeholder="Không bắt buộc" className={desktopInputClass} />
        </div>
        {renderError("referralCode")}
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={handleInputChange("acceptTerms")}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span>
          Tôi đồng ý với <span className="font-medium text-sky-600">Điều khoản sử dụng</span> và{" "}
          <span className="font-medium text-sky-600">Chính sách bảo mật</span> của website
        </span>
      </label>
      {renderError("acceptTerms")}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-sky-500 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
      </button>

      <div className="pt-1 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <button type="button" onClick={() => router.push("/login")} className="font-semibold text-sky-600">
          Đăng nhập ngay
        </button>
      </div>
    </form>
  );

  const mobileForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.username} onChange={handleInputChange("username")} placeholder="Nhập username" className={mobileInputClass} />
        </div>
        {renderError("username")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.email} onChange={handleInputChange("email")} placeholder="Nhập email của bạn" className={mobileInputClass} />
        </div>
        {renderError("email")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Số điện thoại</label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.phone} onChange={handleInputChange("phone")} placeholder="Nhập số điện thoại" className={mobileInputClass} />
        </div>
        {renderError("phone")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="password" value={formData.password} onChange={handleInputChange("password")} placeholder="Nhập mật khẩu" className={mobileInputClass} />
        </div>
        {renderError("password")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="password" value={formData.confirmPassword} onChange={handleInputChange("confirmPassword")} placeholder="Nhập lại mật khẩu" className={mobileInputClass} />
        </div>
        {renderError("confirmPassword")}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Mã giới thiệu</label>
        <div className="relative">
          <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={formData.referralCode} onChange={handleInputChange("referralCode")} placeholder="Không bắt buộc" className={mobileInputClass} />
        </div>
        {renderError("referralCode")}
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={handleInputChange("acceptTerms")}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span>
          Tôi đồng ý với <span className="font-medium text-sky-600">Điều khoản sử dụng</span> và{" "}
          <span className="font-medium text-sky-600">Chính sách bảo mật</span> của website
        </span>
      </label>
      {renderError("acceptTerms")}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-12 w-full rounded-xl bg-sky-500 text-[15px] font-semibold text-white transition hover:bg-sky-600 disabled:opacity-70"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng ký tài khoản"}
      </button>

      <div className="pt-1 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <button type="button" onClick={() => router.push("/login")} className="font-semibold text-sky-600">
          Đăng nhập ngay
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
              Tạo tài khoản <span className="text-sky-500">mới</span>
            </h1>
            <p className="mt-3 max-w-[430px] text-[15px] leading-7 text-slate-600">
              Tham gia cùng chúng tôi để trải nghiệm nền tảng quản lý đơn hàng chuyên nghiệp.
            </p>
            <RegisterIllustration />
            <div className="mt-4 space-y-5">
              {registerFeatures.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <h2 className="text-[18px] font-bold text-slate-900">Đăng ký tài khoản</h2>
            <p className="mt-1 text-sm text-slate-400">Điền thông tin để tạo tài khoản mới</p>
            {desktopForm}
          </div>
        </div>
        <AuthFooter compact />
      </AuthDesktopLayout>

      <AuthMobileShell onBack={() => router.push("/login")}>
        <div className="mb-6">
          <h1 className="text-[30px] font-bold leading-tight text-slate-900">Đăng ký tài khoản</h1>
          <p className="mt-2 text-[14px] leading-6 text-slate-500">Điền thông tin để tiếp tục</p>
        </div>
        {mobileForm}
      </AuthMobileShell>
    </>
  );
}

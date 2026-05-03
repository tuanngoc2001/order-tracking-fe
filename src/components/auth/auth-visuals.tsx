"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  Facebook,
  FileBarChart2,
  Headphones,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-500">
        {icon}
      </div>
      <div>
        <p className="text-[15px] font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-[13px] leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function SocialButton({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:border-sky-200 hover:text-sky-600"
    >
      {icon}
      {label}
    </button>
  );
}

export function LoginIllustration() {
  return (
    <div className="relative mx-auto mt-6 h-[250px] w-[290px]">
      <div className="absolute inset-x-8 bottom-2 h-5 rounded-full bg-sky-100/70 blur-sm" />
      <div className="absolute left-[52px] top-[28px] h-[130px] w-[170px] rounded-[14px] border-[5px] border-sky-400 bg-white shadow-[0_18px_45px_rgba(56,189,248,0.16)]" />
      <div className="absolute left-[76px] top-[54px] h-3 w-16 rounded-full bg-slate-200" />
      <div className="absolute left-[76px] top-[80px] h-12 w-20 rounded-xl bg-sky-100" />
      <div className="absolute left-[168px] top-[58px] h-[54px] w-[54px] rounded-xl border border-sky-100 bg-white p-2 shadow-sm">
        <div className="mt-1 h-1.5 w-8 rounded-full bg-slate-200" />
        <div className="mt-2 h-4 w-full rounded-md bg-gradient-to-r from-sky-300 to-sky-500" />
      </div>
      <div className="absolute left-[78px] top-[142px] h-5 w-[118px] rounded bg-sky-500" />
      <div className="absolute left-[38px] top-[182px] flex h-16 w-16 items-center justify-center rounded-[18px] bg-sky-50 text-sky-500 shadow-sm">
        <ClipboardList className="h-7 w-7" />
      </div>
      <div className="absolute right-[24px] top-[152px] h-[70px] w-[48px] rounded-[12px] border-[4px] border-sky-400 bg-white shadow-sm">
        <div className="mx-auto mt-2 h-2 w-7 rounded-full bg-sky-200" />
        <div className="mx-auto mt-2 h-7 w-7 rounded-md bg-sky-500" />
      </div>
      <div className="absolute right-[42px] top-[22px] flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200">
        <Check className="h-5 w-5" />
      </div>
    </div>
  );
}

export function RegisterIllustration() {
  return (
    <div className="relative mx-auto mt-6 h-[250px] w-[250px]">
      <div className="absolute inset-x-10 bottom-2 h-5 rounded-full bg-sky-100/70 blur-sm" />
      <div className="absolute left-1/2 top-3 h-[170px] w-[150px] -translate-x-1/2 rounded-[28px] border-[5px] border-sky-300 bg-white shadow-[0_18px_45px_rgba(56,189,248,0.16)]" />
      <div className="absolute left-1/2 top-[32px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-sky-100">
        <UserRound className="h-8 w-8 text-sky-500" />
      </div>
      <div className="absolute left-1/2 top-[104px] h-3 w-20 -translate-x-1/2 rounded-full bg-slate-200" />
      <div className="absolute left-1/2 top-[126px] h-3 w-24 -translate-x-1/2 rounded-full bg-slate-200" />
      <div className="absolute left-1/2 top-[148px] h-3 w-16 -translate-x-1/2 rounded-full bg-sky-300" />
      <div className="absolute left-[20px] top-[152px] flex h-14 w-14 items-center justify-center rounded-[18px] bg-sky-500 text-white shadow-lg shadow-sky-200">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <div className="absolute right-[12px] top-[142px] rotate-12 text-sky-500">
        <ClipboardList className="h-16 w-16" strokeWidth={1.7} />
      </div>
    </div>
  );
}

export function ForgotIllustration() {
  return (
    <div className="relative mx-auto mt-6 h-[250px] w-[250px]">
      <div className="absolute inset-x-10 bottom-2 h-5 rounded-full bg-sky-100/70 blur-sm" />
      <div className="absolute left-1/2 top-3 h-[170px] w-[170px] -translate-x-1/2 rounded-[28px] border-[5px] border-sky-300 bg-white shadow-[0_18px_45px_rgba(56,189,248,0.16)]" />
      <div className="absolute left-1/2 top-[34px] -translate-x-1/2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <KeyRound className="h-8 w-8 text-sky-500" />
        </div>
      </div>
      <div className="absolute left-1/2 top-[118px] h-3 w-24 -translate-x-1/2 rounded-full bg-slate-200" />
      <div className="absolute left-1/2 top-[142px] h-10 w-[120px] -translate-x-1/2 rounded-2xl bg-sky-500" />
      <div className="absolute left-[28px] top-[154px] flex h-14 w-14 items-center justify-center rounded-[18px] bg-sky-500 text-white shadow-lg shadow-sky-200">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <div className="absolute right-[18px] top-[44px] flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-500">
        <Mail className="h-5 w-5" />
      </div>
    </div>
  );
}

export function OtpIllustration() {
  return (
    <div className="relative mx-auto mt-6 h-[250px] w-[250px]">
      <div className="absolute inset-x-10 bottom-2 h-5 rounded-full bg-sky-100/70 blur-sm" />
      <div className="absolute left-1/2 top-6 h-[165px] w-[180px] -translate-x-1/2 rounded-[28px] border-[5px] border-sky-300 bg-white shadow-[0_18px_45px_rgba(56,189,248,0.16)]" />
      <div className="absolute left-1/2 top-[34px] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-sky-100">
        <Mail className="h-7 w-7 text-sky-500" />
      </div>
      <div className="absolute left-[30px] top-[160px] flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <div className="absolute right-[24px] top-[160px] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 className="h-6 w-6" />
      </div>
    </div>
  );
}

export function ResetIllustration() {
  return (
    <div className="relative mx-auto mt-6 h-[250px] w-[250px]">
      <div className="absolute inset-x-10 bottom-2 h-5 rounded-full bg-sky-100/70 blur-sm" />
      <div className="absolute left-1/2 top-6 h-[170px] w-[170px] -translate-x-1/2 rounded-[28px] border-[5px] border-sky-300 bg-white shadow-[0_18px_45px_rgba(56,189,248,0.16)]" />
      <div className="absolute left-1/2 top-[34px] flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-sky-100">
        <Lock className="h-8 w-8 text-sky-500" />
      </div>
      <div className="absolute left-1/2 top-[112px] h-3 w-24 -translate-x-1/2 rounded-full bg-slate-200" />
      <div className="absolute left-1/2 top-[140px] h-10 w-[120px] -translate-x-1/2 rounded-2xl bg-sky-500" />
      <div className="absolute right-[24px] top-[156px] flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div className="absolute left-[26px] top-[156px] flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200">
        <ShieldCheck className="h-6 w-6" />
      </div>
    </div>
  );
}

export const loginFeatures = [
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Quản lý đơn hàng dễ dàng",
    description: "Theo dõi và quản lý tất cả đơn hàng của bạn một cách hiệu quả.",
  },
  {
    icon: <FileBarChart2 className="h-5 w-5" />,
    title: "Báo cáo thống kê chi tiết",
    description: "Xem báo cáo và thống kê chi tiết về doanh thu, đơn hàng và khách hàng.",
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn mọi lúc, mọi nơi.",
  },
];

export const registerFeatures = [
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Đăng ký nhanh chóng",
    description: "Chỉ cần vài bước đơn giản để tạo tài khoản và bắt đầu sử dụng.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Bảo mật thông tin",
    description: "Thông tin của bạn được bảo mật tuyệt đối và không chia sẻ với bên thứ ba.",
  },
  {
    icon: <ArrowRight className="h-5 w-5" />,
    title: "Miễn phí sử dụng",
    description: "Sử dụng đầy đủ tính năng cơ bản hoàn toàn miễn phí.",
  },
];

export const googleIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.9 2.6 2.8 6.7 2.8 11.8S6.9 21 12 21c6.9 0 8.6-4.8 8.6-7.3 0-.5 0-.8-.1-1.2H12z" />
  </svg>
);

export const facebookIcon = <Facebook className="h-4 w-4 text-[#1877F2]" />;

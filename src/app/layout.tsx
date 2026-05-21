import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { AppActionProvider } from "@/components/app-action-provider";
import { MessageDialogProvider } from "@/components/message-dialog-provider";

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quản Lý Vận Đơn',
  description: 'Trang web quản lý và theo dõi vận đơn chuyên nghiệp.',
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-[#f8fbff] font-body text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
          )}
        >
        <AppActionProvider>
          <MessageDialogProvider>
            {children}
            <Toaster />
          </MessageDialogProvider>
        </AppActionProvider>
      </body>
    </html>
  );
}

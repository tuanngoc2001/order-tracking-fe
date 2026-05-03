"use client";

import type { ReactNode } from "react";

const zaloSupportUrl = process.env.NEXT_PUBLIC_ZALO_SUPPORT_URL?.trim();
const messengerSupportUrl = process.env.NEXT_PUBLIC_MESSENGER_SUPPORT_URL?.trim();
const telegramSupportUrl = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL?.trim();

type SupportChannel = {
  href: string;
  label: string;
  bgClassName: string;
  icon: ReactNode;
};

function ZaloIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10">
      <path
        d="M8 28.5C8 17.2 17.4 8 32.2 8 46.7 8 56 16.8 56 28.2c0 11.7-9.5 20.7-23.8 20.7-1.8 0-3.6-.1-5.3-.4L16.4 56c-1.2.8-2.8-.2-2.5-1.6l2.1-10.2C11 40.5 8 35 8 28.5Z"
        fill="#0068FF"
      />
      <path
        d="M16.4 24.2h14.1L23 35h7.5v4.8H16.1l7.5-10.8h-7.2v-4.8ZM33.1 23.6h4.8v16.2h-4.8V23.6ZM40.6 32c0-4.9 3.5-8.4 8.1-8.4 4.7 0 8.1 3.5 8.1 8.4s-3.5 8.4-8.1 8.4c-4.7 0-8.1-3.5-8.1-8.4Zm4.8 0c0 2.4 1.3 3.9 3.3 3.9S52 34.4 52 32s-1.3-3.9-3.3-3.9-3.3 1.5-3.3 3.9Z"
        fill="white"
      />
      <circle cx="35.5" cy="19.6" r="2.4" fill="white" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-7 w-7">
      <defs>
        <linearGradient id="messengerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B2FF" />
          <stop offset="100%" stopColor="#006AFF" />
        </linearGradient>
      </defs>
      <path
        d="M32 8c-13.3 0-24 10-24 22.3 0 7 3.5 13.3 9.2 17.5V56l8-4.4c2.1.6 4.4.9 6.8.9 13.3 0 24-10 24-22.2S45.3 8 32 8Z"
        fill="url(#messengerGradient)"
      />
      <path
        d="m18.8 37.2 9.6-10.2c1.5-1.6 3.9-1.8 5.6-.4l7.1 5.4 9.8-10.2-10.9 16.8c-1.4 2.1-4.2 2.7-6.4 1.5l-7.7-4.4-7.1 1.5Z"
        fill="white"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-7 w-7">
      <circle cx="32" cy="32" r="32" fill="#27A7E7" />
      <path
        d="M47.5 18.6 14.8 31.2c-2.2.9-2.2 2.1-.4 2.7l8.4 2.6 3.2 10.2c.4 1.1.2 1.5 1.4 1.5.9 0 1.3-.4 1.8-.9l4.1-4 8.6 6.4c1.6.9 2.7.4 3.1-1.5l5.6-26.4c.6-2.4-.9-3.5-2.9-2.6Z"
        fill="white"
      />
      <path
        d="m26 45.5 1.1-10.3 18.8-11.8c.8-.5-.2-.8-1.2-.2L21.5 37.8l-8.2-2.6c-1.8-.6-1.8-1.8.4-2.6l31.8-12.2c1.5-.6 2.7.4 2.3 2.5L42.5 48c-.4 1.8-1.5 2.3-3 1.5l-8.6-6.5-4.1 4c-.5.5-.9.9-1.8.9-.1 0-.3 0-.4-.1.8-.2 1.1-.9 1.4-2.3Z"
        fill="#C8DAEA"
      />
    </svg>
  );
}

export function SupportFloatingButtons() {
  const channels: SupportChannel[] = [
    ...(zaloSupportUrl
      ? [
          {
            href: zaloSupportUrl,
            label: "Ho tro qua Zalo",
            bgClassName:
              "bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)] hover:bg-slate-50",
            icon: <ZaloIcon />,
          },
        ]
      : []),
    ...(messengerSupportUrl
      ? [
          {
            href: messengerSupportUrl,
            label: "Ho tro qua Messenger",
            bgClassName:
              "bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)] hover:bg-slate-50",
            icon: <MessengerIcon />,
          },
        ]
      : []),
    ...(telegramSupportUrl
      ? [
          {
            href: telegramSupportUrl,
            label: "Ho tro qua Telegram",
            bgClassName:
              "bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.12)] hover:bg-slate-50",
            icon: <TelegramIcon />,
          },
        ]
      : []),
  ];

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {channels.map((channel) => (
        <a
          key={channel.label}
          href={channel.href}
          target="_blank"
          rel="noreferrer"
          aria-label={channel.label}
          title={channel.label}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 transition duration-200 hover:-translate-y-0.5 ${channel.bgClassName}`}
        >
          {channel.icon}
        </a>
      ))}
    </div>
  );
}

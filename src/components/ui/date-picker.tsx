"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarIcon } from "lucide-react";

export default function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 hover:border-sky-400"
      >
        <span>
          {value ? format(value, "dd/MM/yyyy", { locale: vi }) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border bg-white p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            locale={vi}
          />
        </div>
      )}
    </div>
  );
}
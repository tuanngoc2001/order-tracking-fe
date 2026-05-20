"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "shipping_management_theme";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-changing");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  window.setTimeout(() => {
    root.classList.remove("theme-changing");
  }, 260);
}

type ThemeToggleProps = {
  className?: string;
  variant?: "floating" | "inline";
};

export function ThemeToggle({ className, variant = "floating" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Chuyen sang giao dien sang" : "Chuyen sang giao dien toi"}
      title={theme === "dark" ? "Chuyen sang giao dien sang" : "Chuyen sang giao dien toi"}
      className={cn(
        "group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        variant === "floating" &&
          "fixed bottom-5 left-5 z-50 h-11 w-11 rounded-full shadow-lg shadow-slate-200/70 dark:shadow-slate-950/40",
        className
      )}
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 group-active:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 group-active:-rotate-12" />
      )}
    </button>
  );
}

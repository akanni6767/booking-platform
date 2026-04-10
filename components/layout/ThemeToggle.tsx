// components/layout/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  if (!theme) {
    return (
      <button className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="h-5 w-5" />
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 text-amber-500" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-indigo-600" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
// components/layout/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer themed markup until after hydration so server HTML matches the client’s first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- required for next-themes + SSR
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        aria-hidden
      >
        <span className="h-5 w-5 shrink-0" />
        <span className="select-none opacity-0">Theme</span>
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? (
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

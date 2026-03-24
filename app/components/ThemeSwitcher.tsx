"use client";

// components/ThemeSwitcher.tsx
import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./ThemeContext";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Laptop, label: "System" },
  ] as const;

  return (
    <div className="flex items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-2 rounded-full transition-colors ${
            theme === value
              ? "bg-white dark:bg-neutral-700 text-primary-500 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
          aria-label={`Switch to ${label} mode`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;

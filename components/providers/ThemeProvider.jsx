"use client";

import * as React from "react";

const ThemeContext = React.createContext(undefined);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "fibre-admin-theme" }) {
  const [theme, setThemeState] = React.useState(defaultTheme);

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setThemeState(stored);
  }, [storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = React.useCallback(
    (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    [storageKey]
  );

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

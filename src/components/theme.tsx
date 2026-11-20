import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemeMode } from "../domain/theme/theme-mode";
import {
  readPublicThemeFromStorage,
  THEME_PUBLIC_STORAGE_KEY,
  themeModeToDocumentClass,
} from "../domain/theme/theme-mode";

interface ThemeContextValue {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => readPublicThemeFromStorage());

  useEffect(() => {
    const cls = themeModeToDocumentClass(mode);
    document.documentElement.classList.toggle("theme-dark", cls === "theme-dark");
  }, [mode]);

  const setThemeMode = useCallback((next: ThemeMode) => {
    localStorage.setItem(THEME_PUBLIC_STORAGE_KEY, next);
    setMode(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }, [mode, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, toggle, setMode: setThemeMode }),
    [mode, toggle, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}
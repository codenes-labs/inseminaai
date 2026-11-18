export const THEME_PUBLIC_STORAGE_KEY = "inseminaai.themeMode";

export type ThemeMode = "light" | "dark";

const VALID: readonly ThemeMode[] = ["light", "dark"];

export function parseStoredThemeMode(raw: string | null): ThemeMode {
  if (raw !== null && (VALID as readonly string[]).includes(raw)) {
    return raw as ThemeMode;
  }
  return "light";
}

export function readPublicThemeFromStorage(
  storage: Pick<Storage, "getItem"> | null = typeof localStorage === "undefined"
    ? null
    : localStorage,
): ThemeMode {
  return parseStoredThemeMode(storage?.getItem(THEME_PUBLIC_STORAGE_KEY) ?? null);
}

export function themeModeToDocumentClass(mode: ThemeMode): string | null {
  return mode === "dark" ? "theme-dark" : null;
}
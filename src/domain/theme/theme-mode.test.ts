import { describe, expect, it } from "vitest";
import {
  parseStoredThemeMode,
  themeModeToDocumentClass,
} from "./theme-mode";

describe("theme-mode", () => {
  it("defaults to light", () => {
    expect(parseStoredThemeMode(null)).toBe("light");
    expect(parseStoredThemeMode("invalid")).toBe("light");
  });

  it("parses dark", () => {
    expect(parseStoredThemeMode("dark")).toBe("dark");
  });

  it("maps dark to document class", () => {
    expect(themeModeToDocumentClass("dark")).toBe("theme-dark");
    expect(themeModeToDocumentClass("light")).toBeNull();
  });
});
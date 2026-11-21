import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "./id";

describe("randomUUID (offline)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("usa crypto.randomUUID quando disponível", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "00000000-0000-4000-8000-000000000099",
    });
    expect(randomUUID()).toBe("00000000-0000-4000-8000-000000000099");
  });

  it("cai no fallback sem randomUUID", () => {
    vi.stubGlobal("crypto", {});
    const id = randomUUID();
    expect(id.startsWith("offline-")).toBe(true);
  });
});
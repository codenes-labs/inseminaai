import { describe, expect, it } from "vitest";
import { hashSenha, senhaConfere } from "./password";

describe("hash de senha", () => {
  it("confere senha correta", () => {
    const hash = hashSenha("CodenesTemp1");
    expect(senhaConfere("CodenesTemp1", hash)).toBe(true);
    expect(senhaConfere("errada", hash)).toBe(false);
  });
});
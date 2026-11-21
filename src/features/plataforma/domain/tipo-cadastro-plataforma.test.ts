import { describe, expect, it } from "vitest";
import { cadastroPermiteMultiplosAcessos } from "./tipo-cadastro-plataforma";

describe("cadastroPermiteMultiplosAcessos", () => {
  it("autônomo não permite novos acessos", () => {
    expect(cadastroPermiteMultiplosAcessos("autonomo")).toBe(false);
  });

  it("empresa permite equipe", () => {
    expect(cadastroPermiteMultiplosAcessos("empresa")).toBe(true);
  });
});
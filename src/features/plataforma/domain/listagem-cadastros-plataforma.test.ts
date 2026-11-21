import { describe, expect, it } from "vitest";
import {
  CADASTRO_ADMIN_ID,
  CADASTRO_DEMO_ID,
} from "./cadastros-sistema";
import {
  dividirListagemCadastrosGrid,
  filtrarCadastrosPlataformaPorBusca,
  ordenarCadastrosPlataforma,
  paginaSlice,
  totalPaginasListagem,
  type CadastroPlataformaListagem,
} from "./listagem-cadastros-plataforma";

function cadastro(
  id: string,
  nome: string,
  extra?: Partial<CadastroPlataformaListagem>,
): CadastroPlataformaListagem {
  return { id, nome, tipo: "autonomo", ativa: true, ...extra };
}

describe("listagem cadastros plataforma (SPEC-23)", () => {
  it("ordena favoritos no topo e demais alfabeticamente", () => {
    const entrada = [
      cadastro("z-id", "Zeta Fazenda"),
      cadastro(CADASTRO_DEMO_ID, "Cadastro demo"),
      cadastro("a-id", "Alfa"),
      cadastro(CADASTRO_ADMIN_ID, "Cadastro administrador"),
    ];
    const ordenada = ordenarCadastrosPlataforma(entrada);
    expect(ordenada.map((c) => c.id)).toEqual([
      CADASTRO_ADMIN_ID,
      CADASTRO_DEMO_ID,
      "a-id",
      "z-id",
    ]);
  });

  it("filtra por nome ou e-mail", () => {
    const lista = [
      cadastro("1", "Fazenda Sol", { emailLogin: "sol@faz.com" }),
      cadastro("2", "Outra", { emailsBusca: "extra@teste.com" }),
    ];
    expect(filtrarCadastrosPlataformaPorBusca(lista, "sol@")).toHaveLength(1);
    expect(filtrarCadastrosPlataformaPorBusca(lista, "extra@")).toHaveLength(1);
    expect(filtrarCadastrosPlataformaPorBusca(lista, "fazenda")).toHaveLength(1);
  });

  it("divide grid 10 e restante para tabela", () => {
    const lista = Array.from({ length: 15 }, (_, i) => cadastro(String(i), `C${i}`));
    const { grid, restante } = dividirListagemCadastrosGrid(lista);
    expect(grid).toHaveLength(10);
    expect(restante).toHaveLength(5);
  });

  it("paginação da tabela", () => {
    const lista = Array.from({ length: 25 }, (_, i) => i);
    expect(totalPaginasListagem(25, 10)).toBe(3);
    expect(paginaSlice(lista, 2, 10)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  });
});
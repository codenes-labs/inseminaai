import { describe, expect, it } from "vitest";
import {
  deveManterNaFila,
  enfileirarItem,
  ordenarFila,
  removerItem,
} from "./fila-offline";

describe("SPEC-11 fila offline", () => {
  const base = {
    id: "1",
    metodo: "POST" as const,
    caminho: "/api/inseminacoes",
    corpo: "{}",
    tipo: "inseminacao" as const,
    criadoEm: 100,
  };

  it("enfileira e ordena por criação", () => {
    const fila = enfileirarItem([], { ...base, id: "b", criadoEm: 200 });
    const comA = enfileirarItem(fila, { ...base, id: "a", criadoEm: 100 });
    expect(ordenarFila(comA).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("remove só o item sincronizado", () => {
    const fila = enfileirarItem(
      enfileirarItem([], { ...base, id: "a" }),
      { ...base, id: "b", criadoEm: 200 },
    );
    expect(removerItem(fila, "a").map((i) => i.id)).toEqual(["b"]);
  });

  it("falha parcial mantém na fila", () => {
    expect(deveManterNaFila(201)).toBe(false);
    expect(deveManterNaFila(409)).toBe(true);
    expect(deveManterNaFila(500)).toBe(true);
  });
});
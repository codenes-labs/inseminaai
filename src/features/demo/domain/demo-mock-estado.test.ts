import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_MOCK_STORAGE_KEY,
  criarEstadoDemoInicial,
  dashboardDemoPayload,
  filtrarMatrizes,
  gravarEstadoDemoMock,
  lerEstadoDemoMock,
  limparEstadoDemoMock,
  obterEstadoDemoMock,
  reiniciarEstadoDemoMock,
} from "./demo-mock-estado";

function mockSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
  return store;
}

describe("demo-mock-estado", () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cria estado inicial com matrizes e membros demo", () => {
    const estado = criarEstadoDemoInicial();
    expect(estado.matrizes.length).toBeGreaterThan(5);
    expect(estado.membros).toHaveLength(1);
    expect(estado.membros[0]?.email).toBe("teste@teste.com");
    expect(Object.keys(estado.historico).length).toBeGreaterThan(0);
  });

  it("persiste e restaura do sessionStorage", () => {
    const estado = criarEstadoDemoInicial();
    gravarEstadoDemoMock(estado);
    const lido = lerEstadoDemoMock();
    expect(lido?.matrizes).toHaveLength(estado.matrizes.length);
  });

  it("reinicia e limpa o mock", () => {
    const estado = criarEstadoDemoInicial();
    estado.matrizes = [];
    gravarEstadoDemoMock(estado);
    reiniciarEstadoDemoMock();
    const depois = lerEstadoDemoMock();
    expect(depois?.matrizes.length).toBeGreaterThan(0);
    limparEstadoDemoMock();
    expect(lerEstadoDemoMock()).toBeNull();
  });

  it("obterEstadoDemoMock inicializa quando vazio", () => {
    limparEstadoDemoMock();
    const estado = obterEstadoDemoMock();
    expect(estado.matrizes.length).toBeGreaterThan(0);
    expect(sessionStorage.getItem(DEMO_MOCK_STORAGE_KEY)).toBeTruthy();
  });

  it("filtra matrizes por busca e por ativas", () => {
    const estado = criarEstadoDemoInicial();
    const primeira = estado.matrizes[0];
    if (!primeira) throw new Error("sem matriz");
    primeira.ativa = false;
    expect(filtrarMatrizes(estado, undefined, { incluirInativas: false })).not.toContainEqual(
      expect.objectContaining({ id: primeira.id }),
    );
    expect(
      filtrarMatrizes(estado, primeira.nome.slice(0, 3), { incluirInativas: true }),
    ).toContainEqual(expect.objectContaining({ id: primeira.id }));
  });

  it("monta payload do dashboard a partir do estado", () => {
    const estado = criarEstadoDemoInicial();
    const dash = dashboardDemoPayload(estado);
    expect(dash.prenhes).toBeGreaterThanOrEqual(0);
    expect(dash.ultimasInseminacoes.length).toBeGreaterThan(0);
    expect(dash.proximosPartos[0]?.matrizId).toBeTruthy();
  });
});
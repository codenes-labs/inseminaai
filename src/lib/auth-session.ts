import { limparEstadoDemoMock, reiniciarEstadoDemoMock } from "../features/demo/domain/demo-mock-estado";
import type { Session, SessionUser } from "./auth-types";
import { IDLE_MS, STORAGE_KEY } from "./auth-types";

function agora() {
  return Date.now();
}

function paraSession(
  token: string,
  user: {
    email: string;
    nome: string;
    cadastro_id: string;
    papel: SessionUser["papel"];
    demo: boolean;
    plataforma_admin?: boolean;
  },
  expiresAt: number,
): Session {
  const momento = agora();
  return {
    token,
    email: user.email,
    nome: user.nome,
    cadastroId: user.cadastro_id,
    papel: user.papel,
    demo: user.demo,
    plataformaAdmin: Boolean(user.plataforma_admin),
    identificador: user.email,
    expiresAt,
    lastActivityAt: momento,
  };
}

export function lerSessao(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sessao = JSON.parse(raw) as Session;
    if (
      typeof sessao.token !== "string" ||
      typeof sessao.cadastroId !== "string"
    ) {
      return null;
    }
    const momento = agora();
    if (sessao.expiresAt * 1000 <= momento) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (momento - sessao.lastActivityAt > IDLE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (!sessao.identificador) {
      sessao.identificador = sessao.email;
    }
    if (typeof sessao.plataformaAdmin !== "boolean") {
      sessao.plataformaAdmin = false;
    }
    return sessao;
  } catch {
    return null;
  }
}

export function gravarSessaoApi(
  token: string,
  user: {
    email: string;
    nome: string;
    cadastro_id: string;
    papel: SessionUser["papel"];
    demo: boolean;
    plataforma_admin?: boolean;
  },
  expiresAt: number,
) {
  const sessao = paraSession(token, user, expiresAt);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
  if (user.demo) {
    reiniciarEstadoDemoMock();
  } else {
    limparEstadoDemoMock();
  }
  return sessao;
}

export function tocarSessao() {
  const sessao = lerSessao();
  if (!sessao) return null;
  sessao.lastActivityAt = agora();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessao));
  return sessao;
}

export function sessaoValida(): boolean {
  return lerSessao() !== null;
}

export function obterCadastroId(): string | null {
  return lerSessao()?.cadastroId ?? null;
}

export function limparSessao() {
  sessionStorage.removeItem(STORAGE_KEY);
  limparEstadoDemoMock();
}
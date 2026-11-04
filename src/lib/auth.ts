const KEY = "inseminaai.session";

export type Session = {
  identificador: string;
  nome: string;
};

function capitalizar(texto: string) {
  const limpo = texto.trim();
  if (!limpo) return "Vitor";
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

export function nomeDeIdentificador(identificador: string) {
  const bruto = identificador.trim();
  const local = bruto.includes("@") ? bruto.split("@")[0] : bruto;
  const primeiro = local.split(/[.\s_-]+/)[0] || local;
  const mapa: Record<string, string> = {
    vitor: "Vitor",
    vito: "Vitor",
    admin: "Admin",
  };
  return mapa[primeiro.toLowerCase()] ?? capitalizar(primeiro);
}

export function lerSessao(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function gravarSessao(identificador: string) {
  const sessao: Session = {
    identificador: identificador.trim(),
    nome: nomeDeIdentificador(identificador),
  };
  sessionStorage.setItem(KEY, JSON.stringify(sessao));
  return sessao;
}

export function sair() {
  sessionStorage.removeItem(KEY);
}

export function credenciaisOk(identificador: string, senha: string) {
  return identificador.trim().length > 0 && senha.trim().length > 0;
}

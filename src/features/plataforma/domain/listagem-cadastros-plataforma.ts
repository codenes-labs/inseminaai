import {
  CADASTRO_ADMIN_ID,
  CADASTRO_DEMO_ID,
  cadastroProtegidoSistema,
} from "./cadastros-sistema";
import { normalizarTextoBusca, textoBuscaCoincide } from "../../matrizes/domain/busca";

export const LISTAGEM_CADASTROS_GRID_MAX = 10;
export const LISTAGEM_CADASTROS_PAGINA_TABELA = 10;

export type CadastroPlataformaListagem = {
  id: string;
  nome: string;
  tipo: string;
  ativa: boolean;
  /** E-mail do primeiro administrador (exibição e busca). */
  emailLogin?: string;
  /** Todos os e-mails do cadastro, para busca em empresas. */
  emailsBusca?: string;
};

export function cadastroEhFavoritoPlataforma(cadastroId: string): boolean {
  return cadastroProtegidoSistema(cadastroId);
}

function ordemFavoritosSistema(a: string, b: string): number {
  const peso = (id: string) =>
    id === CADASTRO_ADMIN_ID ? 0 : id === CADASTRO_DEMO_ID ? 1 : 2;
  return peso(a) - peso(b);
}

/** Favoritos (seed) no topo; demais em ordem alfabética por nome. */
export function ordenarCadastrosPlataforma<T extends CadastroPlataformaListagem>(
  lista: readonly T[],
): T[] {
  const favoritos = lista.filter((c) => cadastroProtegidoSistema(c.id));
  const demais = lista.filter((c) => !cadastroProtegidoSistema(c.id));
  favoritos.sort((a, b) => ordemFavoritosSistema(a.id, b.id));
  demais.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return [...favoritos, ...demais];
}

export function filtrarCadastrosPlataformaPorBusca<T extends CadastroPlataformaListagem>(
  lista: readonly T[],
  consulta: string,
): T[] {
  const q = normalizarTextoBusca(consulta);
  if (!q) {
    return [...lista];
  }
  return lista.filter(
    (c) =>
      textoBuscaCoincide(c.nome, consulta) ||
      textoBuscaCoincide(c.emailLogin ?? "", consulta) ||
      textoBuscaCoincide(c.emailsBusca ?? "", consulta),
  );
}

export function dividirListagemCadastrosGrid<T>(
  lista: readonly T[],
): { grid: T[]; restante: T[] } {
  if (lista.length <= LISTAGEM_CADASTROS_GRID_MAX) {
    return { grid: [...lista], restante: [] };
  }
  return {
    grid: lista.slice(0, LISTAGEM_CADASTROS_GRID_MAX),
    restante: lista.slice(LISTAGEM_CADASTROS_GRID_MAX),
  };
}

export function paginaSlice<T>(
  lista: readonly T[],
  pagina: number,
  tamanhoPagina: number,
): T[] {
  const p = Math.max(1, pagina);
  const inicio = (p - 1) * tamanhoPagina;
  return lista.slice(inicio, inicio + tamanhoPagina);
}

export function totalPaginasListagem(totalItens: number, tamanhoPagina: number): number {
  if (totalItens <= 0) {
    return 1;
  }
  return Math.ceil(totalItens / tamanhoPagina);
}
import { randomUUID } from "node:crypto";
import { comCadastroId } from "../db/context";
import {
  filtrarAtivos,
  validarNomeCadastro,
} from "../../features/cadastros-auxiliares/domain/validacao";

export class ErroCadastroAuxiliar extends Error {
  constructor(
    message: string,
    readonly codigo: "validacao" | "nao_encontrada",
  ) {
    super(message);
    this.name = "ErroCadastroAuxiliar";
  }
}

export type ReprodutorRow = {
  id: string;
  nome: string;
  raca: string | null;
  codigo_semen: string | null;
  ativo: boolean;
};

export type InseminadorRow = {
  id: string;
  nome: string;
  ativo: boolean;
};

export type LoteRow = {
  id: string;
  nome: string;
  data_inicio: string;
  observacoes: string | null;
  ativo: boolean;
};

function somenteAtivosFlag(valor: string | null): boolean {
  return valor === "1" || valor === "true";
}

export async function listarReprodutores(
  databaseUrl: string,
  cadastroId: string,
  querySomenteAtivos?: string | null,
): Promise<ReprodutorRow[]> {
  const linhas = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<ReprodutorRow>(
      `select id, nome, raca, codigo_semen, ativo
       from public.reprodutores
       order by nome asc`,
    );
    return resultado.rows;
  });
  return filtrarAtivos(linhas, somenteAtivosFlag(querySomenteAtivos ?? null));
}

export async function criarReprodutor(
  databaseUrl: string,
  cadastroId: string,
  input: { nome: string; raca?: string | null; codigo_semen?: string | null },
): Promise<ReprodutorRow> {
  const erro = validarNomeCadastro(input.nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  const id = randomUUID();
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `insert into public.reprodutores
       (id, cadastro_id, nome, raca, codigo_semen, ativo)
       values ($1, $2, $3, $4, $5, true)`,
      [
        id,
        cadastroId,
        input.nome.trim(),
        input.raca?.trim() || null,
        input.codigo_semen?.trim() || null,
      ],
    );
    const resultado = await cliente.query<ReprodutorRow>(
      `select id, nome, raca, codigo_semen, ativo from public.reprodutores where id = $1`,
      [id],
    );
    const linha = resultado.rows[0];
    if (!linha) throw new Error("Falha ao criar reprodutor.");
    return linha;
  });
}

export async function atualizarReprodutor(
  databaseUrl: string,
  cadastroId: string,
  id: string,
  input: Partial<{
    nome: string;
    raca: string | null;
    codigo_semen: string | null;
    ativo: boolean;
  }>,
): Promise<ReprodutorRow> {
  const atual = await obterReprodutor(databaseUrl, cadastroId, id);
  if (!atual) {
    throw new ErroCadastroAuxiliar("Reprodutor não encontrado.", "nao_encontrada");
  }
  const nome = input.nome ?? atual.nome;
  const erro = validarNomeCadastro(nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `update public.reprodutores
       set nome = $2, raca = $3, codigo_semen = $4, ativo = $5
       where id = $1`,
      [
        id,
        nome.trim(),
        input.raca !== undefined ? input.raca?.trim() || null : atual.raca,
        input.codigo_semen !== undefined
          ? input.codigo_semen?.trim() || null
          : atual.codigo_semen,
        input.ativo ?? atual.ativo,
      ],
    );
  });
  const atualizado = await obterReprodutor(databaseUrl, cadastroId, id);
  if (!atualizado) {
    throw new ErroCadastroAuxiliar("Reprodutor não encontrado.", "nao_encontrada");
  }
  return atualizado;
}

export async function obterReprodutor(
  databaseUrl: string,
  cadastroId: string,
  id: string,
): Promise<ReprodutorRow | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<ReprodutorRow>(
      `select id, nome, raca, codigo_semen, ativo from public.reprodutores where id = $1`,
      [id],
    );
    return resultado.rows[0] ?? null;
  });
}

export async function listarInseminadores(
  databaseUrl: string,
  cadastroId: string,
  querySomenteAtivos?: string | null,
): Promise<InseminadorRow[]> {
  const linhas = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<InseminadorRow>(
      `select id, nome, ativo from public.inseminadores order by nome asc`,
    );
    return resultado.rows;
  });
  return filtrarAtivos(linhas, somenteAtivosFlag(querySomenteAtivos ?? null));
}

export async function criarInseminador(
  databaseUrl: string,
  cadastroId: string,
  input: { nome: string },
): Promise<InseminadorRow> {
  const erro = validarNomeCadastro(input.nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  const id = randomUUID();
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `insert into public.inseminadores (id, cadastro_id, nome, ativo)
       values ($1, $2, $3, true)`,
      [id, cadastroId, input.nome.trim()],
    );
    const resultado = await cliente.query<InseminadorRow>(
      `select id, nome, ativo from public.inseminadores where id = $1`,
      [id],
    );
    const linha = resultado.rows[0];
    if (!linha) throw new Error("Falha ao criar inseminador.");
    return linha;
  });
}

export async function atualizarInseminador(
  databaseUrl: string,
  cadastroId: string,
  id: string,
  input: Partial<{ nome: string; ativo: boolean }>,
): Promise<InseminadorRow> {
  const atual = await obterInseminador(databaseUrl, cadastroId, id);
  if (!atual) {
    throw new ErroCadastroAuxiliar("Inseminador não encontrado.", "nao_encontrada");
  }
  const nome = input.nome ?? atual.nome;
  const erro = validarNomeCadastro(nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `update public.inseminadores set nome = $2, ativo = $3 where id = $1`,
      [id, nome.trim(), input.ativo ?? atual.ativo],
    );
  });
  const atualizado = await obterInseminador(databaseUrl, cadastroId, id);
  if (!atualizado) {
    throw new ErroCadastroAuxiliar("Inseminador não encontrado.", "nao_encontrada");
  }
  return atualizado;
}

export async function obterInseminador(
  databaseUrl: string,
  cadastroId: string,
  id: string,
): Promise<InseminadorRow | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<InseminadorRow>(
      `select id, nome, ativo from public.inseminadores where id = $1`,
      [id],
    );
    return resultado.rows[0] ?? null;
  });
}

export async function listarLotes(
  databaseUrl: string,
  cadastroId: string,
  querySomenteAtivos?: string | null,
): Promise<LoteRow[]> {
  const linhas = await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<LoteRow>(
      `select id, nome, data_inicio::text, observacoes, ativo
       from public.lotes
       order by data_inicio desc, nome asc`,
    );
    return resultado.rows;
  });
  return filtrarAtivos(linhas, somenteAtivosFlag(querySomenteAtivos ?? null));
}

export async function criarLote(
  databaseUrl: string,
  cadastroId: string,
  input: { nome: string; data_inicio: string; observacoes?: string | null },
): Promise<LoteRow> {
  const erro = validarNomeCadastro(input.nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  if (!input.data_inicio.trim()) {
    throw new ErroCadastroAuxiliar("Informe a data de início.", "validacao");
  }
  const id = randomUUID();
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `insert into public.lotes (id, cadastro_id, nome, data_inicio, observacoes, ativo)
       values ($1, $2, $3, $4::date, $5, true)`,
      [
        id,
        cadastroId,
        input.nome.trim(),
        input.data_inicio,
        input.observacoes?.trim() || null,
      ],
    );
    const resultado = await cliente.query<LoteRow>(
      `select id, nome, data_inicio::text, observacoes, ativo from public.lotes where id = $1`,
      [id],
    );
    const linha = resultado.rows[0];
    if (!linha) throw new Error("Falha ao criar lote.");
    return linha;
  });
}

export async function atualizarLote(
  databaseUrl: string,
  cadastroId: string,
  id: string,
  input: Partial<{
    nome: string;
    data_inicio: string;
    observacoes: string | null;
    ativo: boolean;
  }>,
): Promise<LoteRow> {
  const atual = await obterLote(databaseUrl, cadastroId, id);
  if (!atual) {
    throw new ErroCadastroAuxiliar("Lote não encontrado.", "nao_encontrada");
  }
  const nome = input.nome ?? atual.nome;
  const erro = validarNomeCadastro(nome);
  if (erro) throw new ErroCadastroAuxiliar(erro, "validacao");
  const dataInicio = input.data_inicio ?? atual.data_inicio;
  await comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    await cliente.query(
      `update public.lotes
       set nome = $2, data_inicio = $3::date, observacoes = $4, ativo = $5
       where id = $1`,
      [
        id,
        nome.trim(),
        dataInicio,
        input.observacoes !== undefined
          ? input.observacoes?.trim() || null
          : atual.observacoes,
        input.ativo ?? atual.ativo,
      ],
    );
  });
  const atualizado = await obterLote(databaseUrl, cadastroId, id);
  if (!atualizado) {
    throw new ErroCadastroAuxiliar("Lote não encontrado.", "nao_encontrada");
  }
  return atualizado;
}

export async function obterLote(
  databaseUrl: string,
  cadastroId: string,
  id: string,
): Promise<LoteRow | null> {
  return comCadastroId(databaseUrl, cadastroId, async (cliente) => {
    const resultado = await cliente.query<LoteRow>(
      `select id, nome, data_inicio::text, observacoes, ativo from public.lotes where id = $1`,
      [id],
    );
    return resultado.rows[0] ?? null;
  });
}
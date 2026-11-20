export type LinhaCsvBruta = {
  matriz: string;
  brinco: string | null;
  reprodutor: string;
  inseminador: string;
  data: string;
  tipo: string;
  lote: string | null;
};

export type LinhaImportacao = LinhaCsvBruta & {
  dataIso: string;
  numeroTentativa: number;
  chaveIdempotencia: string;
};

export function parsearDataCsv(texto: string): string | null {
  const t = texto.trim();
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m}-${d}`;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (iso) return t;
  return null;
}

function normalizarNome(chave: string): string {
  return chave.trim().toLowerCase().replace(/\s+/g, " ");
}

export function chaveIdempotenciaImportacao(
  matriz: string,
  dataIso: string,
  numeroTentativa: number,
): string {
  return `${normalizarNome(matriz)}|${dataIso}|${numeroTentativa}`;
}

export function parsearLinhaCsv(linha: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let entreAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      entreAspas = !entreAspas;
      continue;
    }
    if (c === ";" && !entreAspas) {
      campos.push(atual.trim());
      atual = "";
      continue;
    }
    atual += c;
  }
  campos.push(atual.trim());
  return campos;
}

export function parsearCsv(conteudo: string): LinhaCsvBruta[] {
  const texto = conteudo.replace(/^\uFEFF/, "").trim();
  if (!texto) return [];
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
  if (linhas.length < 2) return [];

  const primeira = parsearLinhaCsv(linhas[0]).map((c) => c.toLowerCase());
  const temCabecalho = primeira[0] === "matriz";
  const dados = temCabecalho ? linhas.slice(1) : linhas;

  return dados.map((linha) => {
    const cols = parsearLinhaCsv(linha);
    return {
      matriz: cols[0]?.trim() ?? "",
      brinco: cols[1]?.trim() || null,
      reprodutor: cols[2]?.trim() ?? "",
      inseminador: cols[3]?.trim() ?? "",
      data: cols[4]?.trim() ?? "",
      tipo: cols[5]?.trim() ?? "",
      lote: cols[6]?.trim() || null,
    };
  });
}

export function deduplicarMatrizesPorNome(
  linhas: LinhaCsvBruta[],
): Map<string, { nome: string; brinco: string | null }> {
  const mapa = new Map<string, { nome: string; brinco: string | null }>();
  for (const linha of linhas) {
    const chave = normalizarNome(linha.matriz);
    if (!chave) continue;
    if (!mapa.has(chave)) {
      mapa.set(chave, { nome: linha.matriz.trim(), brinco: linha.brinco });
    }
  }
  return mapa;
}

function compararDataIso(a: string, b: string): number {
  return a.localeCompare(b);
}

export function montarPlanoImportacao(
  linhas: LinhaCsvBruta[],
): { linhas: LinhaImportacao[]; erros: string[] } {
  const erros: string[] = [];
  const validas: Omit<LinhaImportacao, "numeroTentativa" | "chaveIdempotencia">[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const n = i + (linhas.length > 0 ? 2 : 1);
    if (!linha.matriz.trim()) {
      erros.push(`Linha ${n}: nome da matriz vazio.`);
      continue;
    }
    const dataIso = parsearDataCsv(linha.data);
    if (!dataIso) {
      erros.push(`Linha ${n}: data inválida (${linha.data}).`);
      continue;
    }
    if (!linha.reprodutor.trim() || !linha.inseminador.trim()) {
      erros.push(`Linha ${n}: reprodutor e inseminador obrigatórios.`);
      continue;
    }
    validas.push({ ...linha, dataIso });
  }

  const porMatriz = new Map<string, typeof validas>();
  for (const linha of validas) {
    const chave = normalizarNome(linha.matriz);
    const grupo = porMatriz.get(chave) ?? [];
    grupo.push(linha);
    porMatriz.set(chave, grupo);
  }

  const saida: LinhaImportacao[] = [];
  for (const grupo of porMatriz.values()) {
    const ordenado = [...grupo].sort((a, b) =>
      compararDataIso(a.dataIso, b.dataIso),
    );
    ordenado.forEach((linha, idx) => {
      const numeroTentativa = idx + 1;
      saida.push({
        ...linha,
        numeroTentativa,
        chaveIdempotencia: chaveIdempotenciaImportacao(
          linha.matriz,
          linha.dataIso,
          numeroTentativa,
        ),
      });
    });
  }

  saida.sort((a, b) => {
    const m = normalizarNome(a.matriz).localeCompare(normalizarNome(b.matriz));
    if (m !== 0) return m;
    return a.numeroTentativa - b.numeroTentativa;
  });

  return { linhas: saida, erros };
}

export function tentativasAnterioresParaVazia(
  numeroTentativa: number,
): number[] {
  if (numeroTentativa <= 1) return [];
  return Array.from({ length: numeroTentativa - 1 }, (_, i) => i + 1);
}
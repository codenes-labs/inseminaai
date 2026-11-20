const ISO_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MES = /^(\d{4})-(\d{2})$/;

export type PeriodoRelatorio = {
  inicio: string;
  fim: string;
};

export function fimDoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

export function limitesDoMes(anoMes: string): PeriodoRelatorio {
  const match = ISO_MES.exec(anoMes);
  if (!match) {
    throw new Error("Mês inválido.");
  }
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  if (mes < 1 || mes > 12) throw new Error("Mês inválido.");
  const ultimo = fimDoMes(ano, mes);
  const mm = String(mes).padStart(2, "0");
  return {
    inicio: `${ano}-${mm}-01`,
    fim: `${ano}-${mm}-${String(ultimo).padStart(2, "0")}`,
  };
}

export function periodoMesDe(isoDia: string): PeriodoRelatorio {
  const match = ISO_DIA.exec(isoDia);
  if (!match) throw new Error("Data inválida.");
  return limitesDoMes(`${match[1]}-${match[2]}`);
}

export function resolverPeriodoRelatorio(opcoes: {
  de?: string | null;
  ate?: string | null;
  mes?: string | null;
  hoje?: string;
}): PeriodoRelatorio {
  const de = opcoes.de?.trim() ?? "";
  const ate = opcoes.ate?.trim() ?? "";
  if (de && ate && ISO_DIA.test(de) && ISO_DIA.test(ate)) {
    if (de > ate) throw new Error("A data inicial não pode ser depois da final.");
    return { inicio: de, fim: ate };
  }

  const mes = opcoes.mes?.trim() ?? "";
  if (mes && ISO_MES.test(mes)) {
    return limitesDoMes(mes);
  }

  if (!opcoes.hoje || !ISO_DIA.test(opcoes.hoje)) {
    throw new Error("Data de referência inválida.");
  }
  return periodoMesDe(opcoes.hoje);
}

export function mesAtualDe(isoDia: string): string {
  const match = ISO_DIA.exec(isoDia);
  if (!match) return isoDia.slice(0, 7);
  return `${match[1]}-${match[2]}`;
}

export function ordenarPeriodo(inicio: string, fim: string): PeriodoRelatorio {
  return inicio <= fim ? { inicio, fim } : { inicio: fim, fim: inicio };
}

export function formatarPeriodoBr(periodo: PeriodoRelatorio): string {
  return `${formatarDiaBr(periodo.inicio)} a ${formatarDiaBr(periodo.fim)}`;
}

/** Texto do campo único de período (faixa). */
export function formatarPeriodoCampo(periodo: PeriodoRelatorio): string {
  return `${formatarDiaBr(periodo.inicio)} - ${formatarDiaBr(periodo.fim)}`;
}

export function periodoAteHoje(hoje: string): PeriodoRelatorio {
  const match = ISO_DIA.exec(hoje);
  if (!match) throw new Error("Data inválida.");
  return {
    inicio: `${match[1]}-${match[2]}-01`,
    fim: hoje,
  };
}

export function formatarDiaBr(iso: string): string {
  const match = ISO_DIA.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}
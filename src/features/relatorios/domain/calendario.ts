export type DiaCalendario = {
  iso: string;
  dia: number;
  foraMes: boolean;
};

const ISO_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isoDePartes(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function partesDeIso(iso: string): { ano: number; mes: number; dia: number } {
  const match = ISO_DIA.exec(iso);
  if (!match) throw new Error("Data inválida.");
  return {
    ano: Number(match[1]),
    mes: Number(match[2]),
    dia: Number(match[3]),
  };
}

export function gradeCalendario(ano: number, mes: number): DiaCalendario[] {
  const primeiro = new Date(ano, mes - 1, 1);
  const offset = primeiro.getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const celulas: DiaCalendario[] = [];

  const mesAnterior = mes === 1 ? 12 : mes - 1;
  const anoAnterior = mes === 1 ? ano - 1 : ano;
  const diasMesAnterior = new Date(anoAnterior, mesAnterior, 0).getDate();

  for (let i = offset - 1; i >= 0; i -= 1) {
    const dia = diasMesAnterior - i;
    celulas.push({
      iso: isoDePartes(anoAnterior, mesAnterior, dia),
      dia,
      foraMes: true,
    });
  }

  for (let dia = 1; dia <= diasNoMes; dia += 1) {
    celulas.push({
      iso: isoDePartes(ano, mes, dia),
      dia,
      foraMes: false,
    });
  }

  const restante = celulas.length % 7;
  const preencher = restante === 0 ? 0 : 7 - restante;
  const mesSeguinte = mes === 12 ? 1 : mes + 1;
  const anoSeguinte = mes === 12 ? ano + 1 : ano;

  for (let dia = 1; dia <= preencher; dia += 1) {
    celulas.push({
      iso: isoDePartes(anoSeguinte, mesSeguinte, dia),
      dia,
      foraMes: true,
    });
  }

  return celulas;
}

export function diaEstaNoIntervalo(
  iso: string,
  inicio: string | null,
  fim: string | null,
): boolean {
  if (!inicio) return false;
  if (!fim) return iso === inicio;
  const de = inicio <= fim ? inicio : fim;
  const ate = inicio <= fim ? fim : inicio;
  return iso >= de && iso <= ate;
}

export function tituloMesPt(ano: number, mes: number): string {
  const rotulos = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${rotulos[mes - 1]} de ${ano}`;
}
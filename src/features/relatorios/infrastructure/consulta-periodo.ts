import type { PeriodoRelatorio } from "../domain/periodo";

export type ConsultaRelatorios =
  | { tipo: "mes"; mes: string; hoje: string }
  | { tipo: "intervalo"; de: string; ate: string; hoje: string };

export function montarQueryRelatorios(consulta: ConsultaRelatorios): string {
  const params = new URLSearchParams();
  params.set("hoje", consulta.hoje);
  if (consulta.tipo === "mes") {
    params.set("mes", consulta.mes);
  } else {
    params.set("de", consulta.de);
    params.set("ate", consulta.ate);
  }
  return params.toString();
}

export function queryParaConsulta(
  mes: string,
  intervalo: { de: string; ate: string } | null,
  hoje: string,
): ConsultaRelatorios {
  if (intervalo) {
    return { tipo: "intervalo", de: intervalo.de, ate: intervalo.ate, hoje };
  }
  return { tipo: "mes", mes, hoje };
}

export type PeriodoResumo = PeriodoRelatorio;
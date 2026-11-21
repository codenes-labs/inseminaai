import { describe, expect, it } from "vitest";
import {
  diaEstaNoIntervalo,
  gradeCalendario,
  isoDePartes,
  partesDeIso,
  tituloMesPt,
} from "./calendario";

describe("calendario (domain)", () => {
  it("monta ISO e partes", () => {
    expect(isoDePartes(2026, 3, 5)).toBe("2026-03-05");
    expect(partesDeIso("2026-03-05")).toEqual({ ano: 2026, mes: 3, dia: 5 });
  });

  it("rejeita ISO inválido", () => {
    expect(() => partesDeIso("05-03-2026")).toThrow("Data inválida.");
  });

  it("grade tem múltiplo de 7 células", () => {
    const grade = gradeCalendario(2026, 11);
    expect(grade.length % 7).toBe(0);
    expect(grade.some((c) => !c.foraMes && c.dia === 1)).toBe(true);
  });

  it("grade em janeiro e dezembro cobre virada de ano", () => {
    const jan = gradeCalendario(2026, 1);
    const dez = gradeCalendario(2026, 12);
    expect(jan.some((c) => c.foraMes && c.iso.startsWith("2025-"))).toBe(true);
    expect(dez.some((c) => c.foraMes && c.iso.startsWith("2027-"))).toBe(true);
  });

  it("intervalo de datas", () => {
    expect(diaEstaNoIntervalo("2026-06-10", null, null)).toBe(false);
    expect(diaEstaNoIntervalo("2026-06-10", "2026-06-10", null)).toBe(true);
    expect(diaEstaNoIntervalo("2026-06-15", "2026-06-10", "2026-06-20")).toBe(true);
    expect(diaEstaNoIntervalo("2026-06-25", "2026-06-20", "2026-06-10")).toBe(false);
  });

  it("título do mês em português", () => {
    expect(tituloMesPt(2026, 11)).toBe("Novembro de 2026");
  });
});
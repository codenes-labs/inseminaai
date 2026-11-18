import { describe, expect, it } from "vitest";
import {
  STATUS_INICIAL_INSEMINACAO,
  validarDataInseminacao,
} from "./registrar";

describe("registrar inseminação", () => {
  it("status inicial é pendente", () => {
    expect(STATUS_INICIAL_INSEMINACAO).toBe("pendente");
  });

  it("bloqueia data futura", () => {
    expect(validarDataInseminacao("2026-11-05", "2026-11-04")).not.toBeNull();
    expect(validarDataInseminacao("2026-11-04", "2026-11-04")).toBeNull();
  });
});
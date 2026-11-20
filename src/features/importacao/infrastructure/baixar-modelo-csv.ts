import { MODELO_CSV_IMPORTACAO } from "../domain/csv-modelo";

const NOME_ARQUIVO = "inseminaai-modelo-importacao.csv";

export function baixarModeloCsvImportacao(): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + MODELO_CSV_IMPORTACAO], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = NOME_ARQUIVO;
  link.click();
  URL.revokeObjectURL(url);
}
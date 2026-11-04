export type Situacao = "prenhe" | "pendente" | "vazia" | "sem";

export type Matriz = {
  id: string;
  nome: string;
  brinco: string;
  raca?: string;
  ultimaInseminacao: string | null;
  situacao: Situacao;
};

export type Inseminacao = {
  id: string;
  matrizId: string;
  data: string;
  tipo: "CN" | "IATF" | "Protocolo";
  reprodutor: string;
  inseminador: string;
  lote?: string;
  status: "pendente" | "prenhe" | "vazia";
  numeroTentativa: number;
  dataDiagnosticoPrevista?: string;
  previsaoParto?: string;
  observacoes?: string;
};

export const matrizes: Matriz[] = [
  { id: "1", nome: "Madame", brinco: "0142", raca: "Nelore", ultimaInseminacao: "02/10/2026", situacao: "prenhe" },
  { id: "2", nome: "Fumaça", brinco: "0157", ultimaInseminacao: "18/10/2026", situacao: "pendente" },
  { id: "3", nome: "Amazona", brinco: "0163", ultimaInseminacao: "05/09/2026", situacao: "prenhe" },
  { id: "4", nome: "Bordada", brinco: "0171", ultimaInseminacao: "22/10/2026", situacao: "pendente" },
  { id: "5", nome: "Boneca", brinco: "0188", ultimaInseminacao: "11/08/2026", situacao: "vazia" },
  { id: "6", nome: "Jurema", brinco: "0194", ultimaInseminacao: null, situacao: "sem" },
  { id: "7", nome: "Grauna", brinco: "0203", ultimaInseminacao: "27/10/2026", situacao: "pendente" },
  { id: "8", nome: "Chatinha", brinco: "0215", ultimaInseminacao: "14/10/2026", situacao: "pendente" },
  { id: "9", nome: "Cabrinha", brinco: "0228", ultimaInseminacao: "30/08/2026", situacao: "prenhe" },
  { id: "10", nome: "Cafe", brinco: "0231", ultimaInseminacao: "09/09/2026", situacao: "vazia" },
  { id: "11", nome: "Espada", brinco: "0246", ultimaInseminacao: "15/07/2026", situacao: "prenhe" },
  { id: "12", nome: "Saia Branca", brinco: "0252", ultimaInseminacao: null, situacao: "sem" },
  { id: "13", nome: "Mimosa", brinco: "0267", ultimaInseminacao: "29/10/2026", situacao: "pendente" },
];

export const resumo = {
  inseminadasMes: 24,
  aguardando: 9,
  prenhes: 11,
  vazias: 4,
};

export const proximosPartos = [
  { nome: "Espada", brinco: "0246", data: "24/04/2027", dias: 171 },
  { nome: "Cabrinha", brinco: "0228", data: "08/06/2027", dias: 216 },
  { nome: "Amazona", brinco: "0163", data: "16/06/2027", dias: 224 },
];

export const ultimasInseminacoes = [
  { nome: "Mimosa", brinco: "0267", data: "29/10/2026", tipo: "IATF", reprodutor: "Netuno FIV" },
  { nome: "Grauna", brinco: "0203", data: "27/10/2026", tipo: "CN", reprodutor: "Trovão" },
  { nome: "Bordada", brinco: "0171", data: "22/10/2026", tipo: "Protocolo", reprodutor: "Netuno FIV" },
  { nome: "Fumaça", brinco: "0157", data: "18/10/2026", tipo: "IATF", reprodutor: "Barão TE" },
];

export const reprodutores = ["Netuno FIV", "Barão TE", "Trovão", "Imperador"];
export const inseminadores = ["Vitor Almeida", "Carlos Souza", "Ana Ribeiro"];
export const lotes = ["Lote 1 – Maternidade", "Lote 2 – Novilhas", "Lote 3 – Pasto Alto"];

export const historicoPorMatriz: Record<string, Inseminacao[]> = {
  "1": [
    { id: "ia-1", matrizId: "1", data: "02/10/2026", tipo: "IATF", reprodutor: "Netuno FIV", inseminador: "Vitor Almeida", status: "prenhe", numeroTentativa: 1, previsaoParto: "11/07/2027" },
  ],
  "2": [
    { id: "ia-2", matrizId: "2", data: "18/10/2026", tipo: "IATF", reprodutor: "Barão TE", inseminador: "Vitor Almeida", status: "pendente", numeroTentativa: 1, dataDiagnosticoPrevista: "17/11/2026" },
  ],
  "5": [
    { id: "ia-5b", matrizId: "5", data: "11/08/2026", tipo: "CN", reprodutor: "Trovão", inseminador: "Carlos Souza", status: "vazia", numeroTentativa: 2 },
    { id: "ia-5a", matrizId: "5", data: "20/06/2026", tipo: "IATF", reprodutor: "Imperador", inseminador: "Vitor Almeida", status: "vazia", numeroTentativa: 1 },
  ],
  "8": [
    { id: "ia-8", matrizId: "8", data: "14/10/2026", tipo: "Protocolo", reprodutor: "Netuno FIV", inseminador: "Ana Ribeiro", lote: "Lote 2 – Novilhas", status: "pendente", numeroTentativa: 1, dataDiagnosticoPrevista: "13/11/2026" },
  ],
};

export function historicoDaMatriz(id: string): Inseminacao[] {
  const existente = historicoPorMatriz[id];
  if (existente) return existente;
  const matriz = matrizes.find((m) => m.id === id);
  if (!matriz?.ultimaInseminacao) return [];
  const status = matriz.situacao === "sem" ? "pendente" : matriz.situacao;
  return [
    {
      id: `ia-${id}`,
      matrizId: id,
      data: matriz.ultimaInseminacao,
      tipo: "IATF",
      reprodutor: "Netuno FIV",
      inseminador: "Vitor Almeida",
      status,
      numeroTentativa: 1,
      previsaoParto: status === "prenhe" ? "não calculada" : undefined,
      dataDiagnosticoPrevista: status === "pendente" ? undefined : undefined,
    },
  ];
}

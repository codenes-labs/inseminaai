import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, Search, TriangleAlert } from "lucide-react";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Campo,
  Cartao,
  cx,
  inputClass,
} from "../components/ui";
import { inseminadores, lotes, matrizes, reprodutores } from "../data/mock";

const tipos = ["CN", "IATF", "Protocolo"] as const;

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function SelectField({
  opcoes,
  valor,
  placeholder,
  onChange,
}: {
  opcoes: string[];
  valor?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <>
      <select
        value={valor ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-12 w-full appearance-none bg-transparent text-base outline-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((op) => (
          <option key={op}>{op}</option>
        ))}
      </select>
      <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
    </>
  );
}

export function NovaInseminacao() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("IATF");
  const [matriz, setMatriz] = useState("Chatinha");
  const [aberto, setAberto] = useState(false);
  const [reprodutor, setReprodutor] = useState("");
  const [inseminador, setInseminador] = useState("Vitor Almeida");
  const [lote, setLote] = useState("");

  const encontradas = useMemo(
    () =>
      matrizes.filter(
        (m) =>
          m.nome.toLowerCase().includes(matriz.toLowerCase()) ||
          m.brinco.includes(matriz),
      ),
    [matriz],
  );

  const selecionada = matrizes.find(
    (m) => m.nome.toLowerCase() === matriz.toLowerCase(),
  );
  const pendente = selecionada?.situacao === "pendente";

  function salvar(e: FormEvent) {
    e.preventDefault();
    navigate("/inicio");
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo="Nova inseminação" voltar="/inicio" />
      <form onSubmit={salvar}>
        <div className="px-4 pb-32 pt-4">
          <Cartao className="space-y-5 p-4">
            <div className="relative">
              <Campo
                rotulo="Matriz"
                icone={<Search className="size-5" strokeWidth={1.75} />}
              >
                <input
                  value={matriz}
                  placeholder="Buscar por nome ou brinco"
                  onFocus={() => setAberto(true)}
                  onBlur={() => setTimeout(() => setAberto(false), 150)}
                  onChange={(e) => {
                    setMatriz(e.target.value);
                    setAberto(true);
                  }}
                  className={inputClass}
                />
              </Campo>
              {aberto && (
                <ul className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover py-1 shadow-(--shadow-card)">
                  {encontradas.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setMatriz(m.nome);
                          setAberto(false);
                        }}
                        className="flex min-h-12 w-full items-center justify-between px-4 text-left hover:bg-accent"
                      >
                        <span className="font-medium">{m.nome}</span>
                        <span className="text-sm text-muted-foreground">#{m.brinco}</span>
                      </button>
                    </li>
                  ))}
                  {encontradas.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      Nenhuma matriz encontrada
                    </li>
                  )}
                </ul>
              )}
            </div>
            {pendente && (
              <div className="flex items-start gap-2.5 rounded-md bg-warning-soft p-3 text-sm text-foreground">
                <TriangleAlert
                  className="mt-0.5 size-5 shrink-0 text-status-pendente"
                  strokeWidth={1.75}
                />
                Esta matriz já tem inseminação pendente
              </div>
            )}
            <Campo rotulo="Data" icone={<Calendar className="size-5" strokeWidth={1.75} />}>
              <input type="date" defaultValue={hojeISO()} className={inputClass} />
            </Campo>
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Tipo</span>
              <div className="grid grid-cols-3 gap-2">
                {tipos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={cx(
                      "press min-h-14 rounded-md border text-base font-semibold",
                      tipo === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Campo rotulo="Reprodutor">
              <SelectField
                opcoes={reprodutores}
                valor={reprodutor}
                placeholder="Selecione o reprodutor"
                onChange={setReprodutor}
              />
            </Campo>
            <Campo rotulo="Inseminador">
              <SelectField
                opcoes={inseminadores}
                valor={inseminador}
                onChange={setInseminador}
              />
            </Campo>
            <Campo rotulo="Lote" opcional>
              <SelectField
                opcoes={lotes}
                valor={lote}
                placeholder="Sem lote"
                onChange={setLote}
              />
            </Campo>
            <label className="block">
              <span className="mb-1.5 flex gap-1 text-sm font-semibold">
                Observações{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </span>
              <textarea
                rows={3}
                placeholder="Ex.: cio forte pela manhã"
                className="w-full rounded-md border border-input bg-card p-3.5 text-base outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </label>
          </Cartao>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Botao type="submit">Salvar inseminação</Botao>
        </div>
      </form>
    </AppShell>
  );
}

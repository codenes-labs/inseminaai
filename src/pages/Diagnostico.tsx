import { FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell, Botao, CabecalhoVoltar, Campo, Cartao, cx, inputClass } from "../components/ui";
import { historicoDaMatriz, matrizes } from "../data/mock";

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function Diagnostico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const matriz = matrizes.find((m) => m.id === id);
  const pendente = id ? historicoDaMatriz(id).find((h) => h.status === "pendente") : undefined;
  const [resultado, setResultado] = useState<"prenhe" | "vazia">("prenhe");

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (resultado === "vazia") {
      navigate("/nova-inseminacao");
      return;
    }
    navigate(id ? `/matrizes/${id}` : "/matrizes");
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar
        titulo="Registrar diagnóstico"
        voltar={id ? `/matrizes/${id}` : "/matrizes"}
      />
      <form onSubmit={salvar} className="px-4 pb-32 pt-4">
        <Cartao className="space-y-5 p-4">
          <p className="text-sm text-muted-foreground">
            {matriz ? `${matriz.nome} #${matriz.brinco}` : "Matriz"}
            {pendente ? ` · IA em ${pendente.data}` : ""}
          </p>
          <div>
            <span className="mb-1.5 block text-sm font-semibold">Resultado</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["prenhe", "Prenhe"],
                  ["vazia", "Vazia"],
                ] as const
              ).map(([idRes, rotulo]) => (
                <button
                  key={idRes}
                  type="button"
                  onClick={() => setResultado(idRes)}
                  className={cx(
                    "press min-h-14 rounded-md border text-base font-semibold",
                    resultado === idRes
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          </div>
          <Campo rotulo="Data do diagnóstico">
            <input type="date" defaultValue={hojeISO()} className={inputClass} />
          </Campo>
          <label className="block">
            <span className="mb-1.5 flex gap-1 text-sm font-semibold">
              Observações{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </span>
            <textarea
              rows={3}
              className="w-full rounded-md border border-input bg-card p-3.5 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>
          {resultado === "prenhe" && (
            <p className="text-sm text-muted-foreground">
              A previsão de parto é calculada com 283 dias a partir da inseminação.
            </p>
          )}
          {resultado === "vazia" && (
            <p className="text-sm text-muted-foreground">
              Ao salvar, você pode registrar a repetição na tela seguinte.
            </p>
          )}
        </Cartao>
        <div className="mt-4">
          <Botao type="submit">
            {resultado === "vazia" ? "Salvar e repetir" : "Salvar diagnóstico"}
          </Botao>
        </div>
      </form>
    </AppShell>
  );
}

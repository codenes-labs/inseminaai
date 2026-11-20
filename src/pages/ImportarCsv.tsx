import { FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileUp } from "lucide-react";
import {
  AppShell,
  Botao,
  Cartao,
  cx,
  inputClass,
} from "../components/ui";
import { baixarModeloCsvImportacao } from "../features/importacao/infrastructure/baixar-modelo-csv";
import { importarCsvApi } from "../features/importacao/infrastructure/importacao-api";

export function ImportarCsv() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    criadas: number;
    ignoradas: number;
    erros: string[];
  } | null>(null);

  function aoEscolherArquivo() {
    inputRef.current?.click();
  }

  function aoMudarArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    setResultado(null);
    setErro(null);
    if (!arquivo) {
      setArquivoNome(null);
      setConteudo(null);
      return;
    }
    if (!arquivo.name.toLowerCase().endsWith(".csv")) {
      setErro("Use um arquivo .csv (UTF-8, separador ;).");
      setArquivoNome(null);
      setConteudo(null);
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      const texto = typeof leitor.result === "string" ? leitor.result : "";
      setConteudo(texto);
      setArquivoNome(arquivo.name);
    };
    leitor.onerror = () => {
      setErro("Não foi possível ler o arquivo.");
    };
    leitor.readAsText(arquivo, "UTF-8");
  }

  async function aoEnviar(event: FormEvent) {
    event.preventDefault();
    if (!conteudo?.trim()) {
      setErro("Escolha um arquivo CSV primeiro.");
      return;
    }
    setCarregando(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await importarCsvApi(conteudo);
      setResultado(res);
    } catch (cause) {
      setErro(cause instanceof Error ? cause.message : "Falha na importação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <Link to="/mais" className="press -ml-2 text-sm font-medium">
          ← Mais
        </Link>
        <h1 className="text-lg font-semibold">Importar planilha</h1>
      </header>
      <form className="space-y-4 px-4 py-4" onSubmit={aoEnviar}>
        <Cartao className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            Envie um CSV com as colunas matriz, brinco, reprodutor, inseminador,
            data, tipo e lote. Datas em dd/MM/aaaa ou aaaa-mm-dd. Separador{" "}
            <strong>;</strong> e encoding UTF-8.
          </p>
          <Botao
            type="button"
            variante="suave"
            onClick={baixarModeloCsvImportacao}
          >
            <Download className="size-5" />
            Baixar modelo (.csv)
          </Botao>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={aoMudarArquivo}
          />
          <button
            type="button"
            onClick={aoEscolherArquivo}
            className={cx(
              inputClass,
              "press flex min-h-14 w-full items-center justify-center gap-2 border-dashed",
            )}
          >
            <FileUp className="size-5 text-primary" />
            <span>{arquivoNome ?? "Escolher arquivo .csv"}</span>
          </button>
          {erro ? (
            <p className="text-sm text-destructive" role="alert">
              {erro}
            </p>
          ) : null}
          <Botao type="submit" disabled={carregando || !conteudo}>
            {carregando ? "Importando…" : "Importar"}
          </Botao>
        </Cartao>

        {resultado ? (
          <Cartao className="space-y-2 p-4">
            <p className="font-semibold">Resultado</p>
            <p className="text-sm">
              {resultado.criadas} inseminação(ões) criadas,{" "}
              {resultado.ignoradas} ignoradas (já existiam).
            </p>
            {resultado.erros.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {resultado.erros.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            ) : null}
          </Cartao>
        ) : null}
      </form>
    </AppShell>
  );
}
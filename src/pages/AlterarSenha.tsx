import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Wand2 } from "lucide-react";
import { AppShell, Botao, Campo, inputClass } from "../components/ui";
import {
  gerarSenhaSugerida,
  senhaNovaValida,
} from "../features/conta/domain/gerar-senha";
import { alterarSenhaApi } from "../features/conta/infrastructure/alterar-senha-api";

export function AlterarSenha() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [exibirSenhas, setExibirSenhas] = useState(false);

  const tipoCampoSenha = exibirSenhas ? "text" : "password";

  function sugerirSenha() {
    const sugestao = gerarSenhaSugerida();
    setNova(sugestao);
    setConfirmar(sugestao);
    setExibirSenhas(true);
    setErro("");
    setSucesso(false);
  }

  async function aoEnviar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setSucesso(false);
    if (!senhaNovaValida(nova)) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      setErro("A confirmação não coincide com a nova senha.");
      return;
    }
    setSalvando(true);
    try {
      const res = await alterarSenhaApi(atual, nova);
      if (!res.ok) {
        setErro(res.erro);
        return;
      }
      setSucesso(true);
      setAtual("");
      setNova("");
      setConfirmar("");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <Link
          to="/mais/configuracoes"
          className="press -ml-2 text-sm font-medium opacity-90"
        >
          ← Configurações
        </Link>
        <h1 className="text-lg font-semibold">Alterar senha</h1>
      </header>
      <form className="space-y-4 px-4 py-4" onSubmit={(e) => void aoEnviar(e)}>
        <p className="text-sm text-muted-foreground">
          Use uma senha forte. Você pode gerar uma sugestão e guardá-la em local
          seguro.
        </p>
        <button
          type="button"
          className="press text-sm font-semibold text-primary"
          onClick={() => setExibirSenhas((v) => !v)}
        >
          {exibirSenhas ? "Ocultar senhas" : "Exibir senhas"}
        </button>
        {erro ? (
          <p className="text-sm font-medium text-status-vazia" role="alert">
            {erro}
          </p>
        ) : null}
        {sucesso ? (
          <p className="text-sm font-medium text-status-prenhe" role="status">
            Senha alterada com sucesso.
          </p>
        ) : null}
        <Campo
          rotulo="Senha atual"
          icone={<KeyRound className="size-5" strokeWidth={1.75} />}
        >
          <input
            type={tipoCampoSenha}
            autoComplete="current-password"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            className={inputClass}
            required
          />
        </Campo>
        <Campo rotulo="Nova senha">
          <input
            type={tipoCampoSenha}
            autoComplete="new-password"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            className={inputClass}
            required
          />
        </Campo>
        <Campo rotulo="Confirmar nova senha">
          <input
            type={tipoCampoSenha}
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className={inputClass}
            required
          />
        </Campo>
        <Botao type="button" variante="suave" onClick={sugerirSenha}>
          <Wand2 className="size-5" />
          Gerar senha sugerida
        </Botao>
        <Botao type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar nova senha"}
        </Botao>
      </form>
    </AppShell>
  );
}
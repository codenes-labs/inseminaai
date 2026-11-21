import { FormEvent, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Wand2 } from "lucide-react";
import { Botao, Cartao, cx, inputClass } from "../../components/ui";
import {
  gerarSenhaSugerida,
  senhaNovaValida,
} from "../../features/conta/domain/gerar-senha";
import { criarCadastroPlataformaApi } from "../../features/plataforma/infrastructure/plataforma-api";
import type { WebCadastrosLayoutContext } from "./WebCadastrosLayout";

export function WebCadastros() {
  const navigate = useNavigate();
  const { recarregarListaCadastros } =
    useOutletContext<WebCadastrosLayoutContext>();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"autonomo" | "empresa">("autonomo");
  const [exibirSenha, setExibirSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function sugerirSenha() {
    const sugestao = gerarSenhaSugerida();
    setSenha(sugestao);
    setExibirSenha(true);
    setErro("");
    setSucesso("");
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    if (!senhaNovaValida(senha)) {
      setErro("A senha inicial deve ter pelo menos 8 caracteres.");
      return;
    }
    setSalvando(true);
    try {
      const { cadastroId } = await criarCadastroPlataformaApi({
        nomeCadastro,
        nomeUsuario,
        email,
        senha,
        tipo,
      });
      setSucesso(
        tipo === "empresa"
          ? "Empresa criada. Adicione mais acessos ao abrir o cadastro."
          : "Autônomo criado. O usuário já pode entrar em /entrar.",
      );
      setNomeCadastro("");
      setNomeUsuario("");
      setEmail("");
      setSenha("");
      setExibirSenha(false);
      await recarregarListaCadastros();
      navigate(`/admin/cadastros/${cadastroId}`);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro ao criar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Cartao className="p-5">
      <h2 className="text-lg font-semibold">Novo cadastro</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cria o cliente e o primeiro acesso (administrador do cadastro).
      </p>
      <form className="mt-4 space-y-3" onSubmit={enviar}>
        <div>
          <span className="mb-1.5 block text-sm font-semibold">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            {(["autonomo", "empresa"] as const).map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => setTipo(opcao)}
                className={cx(
                  "press min-h-11 rounded-md border text-sm font-semibold",
                  tipo === opcao
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card",
                )}
              >
                {opcao === "autonomo" ? "Autônomo" : "Empresa"}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm font-semibold">
          Nome do cadastro
          <input
            className={`${inputClass} mt-1`}
            value={nomeCadastro}
            onChange={(e) => setNomeCadastro(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Nome do usuário
          <input
            className={`${inputClass} mt-1`}
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          E-mail
          <input
            type="email"
            className={`${inputClass} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Senha inicial
          <input
            type={exibirSenha ? "text" : "password"}
            className={`${inputClass} mt-1`}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={8}
          />
        </label>
        <Botao type="button" variante="suave" onClick={sugerirSenha}>
          <Wand2 className="size-5" />
          Gerar senha sugerida
        </Botao>
        {erro ? <p className="text-sm text-status-vazia">{erro}</p> : null}
        {sucesso ? <p className="text-sm text-brand">{sucesso}</p> : null}
        <Botao type="submit" disabled={salvando}>
          {salvando ? "Criando…" : "Criar cadastro"}
        </Botao>
      </form>
    </Cartao>
  );
}
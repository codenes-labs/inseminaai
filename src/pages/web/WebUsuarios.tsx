import { FormEvent, useEffect, useState } from "react";
import type { Papel } from "../../lib/auth-types";
import { lerSessao } from "../../lib/auth";
import {
  AppShell,
  Botao,
  CabecalhoVoltar,
  Cartao,
  cx,
  inputClass,
} from "../../components/ui";
import {
  alterarMembroAtivoApi,
  criarMembroCadastroApi,
  listarMembrosCadastroApi,
  type MembroCadastro,
} from "../../features/conta/infrastructure/cadastro-membros-api";
const PAPEIS: Papel[] = ["inseminador", "administrador"];

export function WebUsuarios() {
  const [lista, setLista] = useState<MembroCadastro[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Papel>("inseminador");
  const [salvando, setSalvando] = useState(false);
  const eu = lerSessao();

  async function carregar() {
    try {
      const dados = await listarMembrosCadastroApi();
      setLista(dados);
    } catch {
      setErro("Não foi possível carregar os usuários.");
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      await criarMembroCadastroApi({ nome, email, senha, papel });
      setSucesso("Usuário criado. Ele já pode entrar em /entrar.");
      setNome("");
      setEmail("");
      setSenha("");
      setPapel("inseminador");
      await carregar();
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro ao criar.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(membro: MembroCadastro) {
    setErro("");
    setSucesso("");
    try {
      await alterarMembroAtivoApi(membro.userId, !membro.ativo);
      await carregar();
      setSucesso(membro.ativo ? "Acesso desativado." : "Acesso reativado.");
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro ao atualizar.");
    }
  }

  return (
    <AppShell semBarra>
      <CabecalhoVoltar titulo="Gestão de acessos" voltar="/mais" />
      <div className="grid gap-8 px-4 py-4 lg:grid-cols-2">
        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Novo acesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria login no mesmo cadastro (inseminador ou outro administrador).
          </p>
          <form className="mt-4 space-y-3" onSubmit={enviar}>
            <label className="block text-sm font-semibold">
              Nome
              <input
                className={`${inputClass} mt-1`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
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
                type="password"
                className={`${inputClass} mt-1`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Papel</span>
              <div className="grid grid-cols-2 gap-2">
                {PAPEIS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPapel(p)}
                    className={cx(
                      "press min-h-11 rounded-md border text-sm font-semibold",
                      papel === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {p === "administrador" ? "Administrador" : "Inseminador"}
                  </button>
                ))}
              </div>
            </div>
            {erro && <p className="text-sm text-status-vazia">{erro}</p>}
            {sucesso && <p className="text-sm text-brand">{sucesso}</p>}
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Criando…" : "Criar usuário"}
            </Botao>
          </form>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Usuários</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lista.length === 0 ? (
              <li className="text-muted-foreground">Nenhum usuário.</li>
            ) : (
              lista.map((membro) => (
                <li
                  key={membro.userId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{membro.nome}</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {membro.email} · {membro.papel}
                      {!membro.ativo ? " · inativo" : ""}
                    </span>
                  </div>
                  {eu?.email !== membro.email ? (
                    <button
                      type="button"
                      className="press text-sm font-medium text-primary"
                      onClick={() => void alternarAtivo(membro)}
                    >
                      {membro.ativo ? "Desativar" : "Reativar"}
                    </button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </Cartao>
      </div>
    </AppShell>
  );
}
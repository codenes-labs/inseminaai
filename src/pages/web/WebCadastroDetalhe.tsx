import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import type { Papel } from "../../lib/auth-types";
import { Botao, Cartao, cx, inputClass } from "../../components/ui";
import type { MembroCadastro } from "../../features/conta/infrastructure/cadastro-membros-api";
import {
  atualizarCadastroPlataformaApi,
  alterarMembroPlataformaAtivoApi,
  criarMembroPlataformaCadastroApi,
  listarMembrosPlataformaCadastroApi,
  obterCadastroPlataformaApi,
} from "../../features/plataforma/infrastructure/plataforma-api";
import { WebShell } from "./WebShell";

const PAPEIS: Papel[] = ["inseminador", "administrador"];

export function WebCadastroDetalhe() {
  const { cadastroId } = useParams<{ cadastroId: string }>();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<"autonomo" | "empresa">("autonomo");
  const [ativa, setAtiva] = useState(true);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState("");
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);
  const [carregandoCadastro, setCarregandoCadastro] = useState(true);

  const [membros, setMembros] = useState<MembroCadastro[]>([]);
  const [erroAcessos, setErroAcessos] = useState("");
  const [sucessoAcesso, setSucessoAcesso] = useState("");
  const [nomeNovo, setNomeNovo] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [senhaNovo, setSenhaNovo] = useState("");
  const [papelNovo, setPapelNovo] = useState<Papel>("inseminador");
  const [salvandoAcesso, setSalvandoAcesso] = useState(false);

  const carregarCadastro = useCallback(async () => {
    if (!cadastroId) {
      setErroCadastro("Cadastro inválido.");
      setCarregandoCadastro(false);
      return;
    }
    setCarregandoCadastro(true);
    setErroCadastro("");
    try {
      const dados = await obterCadastroPlataformaApi(cadastroId);
      setNome(dados.nome);
      setTipo(dados.tipo === "empresa" ? "empresa" : "autonomo");
      setAtiva(dados.ativa);
    } catch {
      setErroCadastro("Não foi possível carregar o cadastro.");
    } finally {
      setCarregandoCadastro(false);
    }
  }, [cadastroId]);

  const carregarAcessos = useCallback(async () => {
    if (!cadastroId) {
      return;
    }
    setErroAcessos("");
    try {
      const lista = await listarMembrosPlataformaCadastroApi(cadastroId);
      setMembros(lista);
    } catch {
      setErroAcessos("Não foi possível carregar os acessos.");
    }
  }, [cadastroId]);

  useEffect(() => {
    void carregarCadastro();
    void carregarAcessos();
  }, [carregarCadastro, carregarAcessos]);

  async function salvarCadastro(e: FormEvent) {
    e.preventDefault();
    if (!cadastroId) {
      return;
    }
    setErroCadastro("");
    setSucessoCadastro("");
    setSalvandoCadastro(true);
    try {
      await atualizarCadastroPlataformaApi(cadastroId, { nome, tipo, ativa });
      setSucessoCadastro("Cliente salvo.");
    } catch (caught) {
      setErroCadastro(caught instanceof Error ? caught.message : "Erro ao salvar.");
    } finally {
      setSalvandoCadastro(false);
    }
  }

  async function criarAcesso(e: FormEvent) {
    e.preventDefault();
    if (!cadastroId) {
      return;
    }
    setErroAcessos("");
    setSucessoAcesso("");
    setSalvandoAcesso(true);
    try {
      await criarMembroPlataformaCadastroApi(cadastroId, {
        nome: nomeNovo,
        email: emailNovo,
        senha: senhaNovo,
        papel: papelNovo,
      });
      setSucessoAcesso("Acesso criado.");
      setNomeNovo("");
      setEmailNovo("");
      setSenhaNovo("");
      setPapelNovo("inseminador");
      await carregarAcessos();
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao criar.");
    } finally {
      setSalvandoAcesso(false);
    }
  }

  async function alternarAtivo(membro: MembroCadastro) {
    if (!cadastroId) {
      return;
    }
    setErroAcessos("");
    setSucessoAcesso("");
    try {
      await alterarMembroPlataformaAtivoApi(cadastroId, membro.userId, !membro.ativo);
      await carregarAcessos();
      setSucessoAcesso(membro.ativo ? "Acesso desativado." : "Acesso reativado.");
    } catch (caught) {
      setErroAcessos(caught instanceof Error ? caught.message : "Erro ao atualizar.");
    }
  }

  return (
    <WebShell titulo="">
      <div className="mb-6 flex gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Building2 className="size-7" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Cliente</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dados do cliente (cadastro) e logins de quem entra nele. Papel administrador pode
            gerir usuários no web; inseminador usa só o app.
          </p>
        </div>
      </div>

      <Link
        to="/admin/cadastros"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Voltar à lista de clientes
      </Link>

      {erroAcessos ? (
        <p className="mt-4 rounded-lg bg-status-vazia/15 px-3 py-2 text-sm text-status-vazia">
          {erroAcessos}
        </p>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={salvarCadastro}>
        <Cartao className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Dados do cliente</h2>
          {carregandoCadastro ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : (
            <>
              <label className="block text-sm font-semibold">
                Nome do cadastro
                <input
                  className={`${inputClass} mt-1`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </label>
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
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-border"
                  checked={ativa}
                  onChange={(e) => setAtiva(e.target.checked)}
                />
                <span>Cliente ativo (pode usar o sistema)</span>
              </label>
              {erroCadastro ? (
                <p className="text-sm text-status-vazia">{erroCadastro}</p>
              ) : null}
              {sucessoCadastro ? (
                <p className="text-sm text-brand">{sucessoCadastro}</p>
              ) : null}
              <Botao type="submit" disabled={salvandoCadastro}>
                {salvandoCadastro ? "Salvando…" : "Salvar cliente"}
              </Botao>
            </>
          )}
        </Cartao>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Novo acesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria login neste cliente (inseminador ou administrador do cadastro).
          </p>
          <form className="mt-4 space-y-3" onSubmit={criarAcesso}>
            <label className="block text-sm font-semibold">
              Nome
              <input
                className={`${inputClass} mt-1`}
                value={nomeNovo}
                onChange={(e) => setNomeNovo(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              E-mail (login)
              <input
                type="email"
                className={`${inputClass} mt-1`}
                value={emailNovo}
                onChange={(e) => setEmailNovo(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold">
              Senha inicial
              <input
                type="password"
                className={`${inputClass} mt-1`}
                value={senhaNovo}
                onChange={(e) => setSenhaNovo(e.target.value)}
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
                    onClick={() => setPapelNovo(p)}
                    className={cx(
                      "press min-h-11 rounded-md border text-sm font-semibold",
                      papelNovo === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {p === "administrador" ? "Administrador" : "Inseminador"}
                  </button>
                ))}
              </div>
            </div>
            <Botao type="submit" disabled={salvandoAcesso}>
              {salvandoAcesso ? "Criando…" : "Criar acesso"}
            </Botao>
          </form>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Acessos existentes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie todos os logins deste cliente.
          </p>
          {sucessoAcesso ? (
            <p className="mt-3 text-sm text-brand">{sucessoAcesso}</p>
          ) : null}
          <ul className="mt-4 space-y-2 text-sm">
            {membros.length === 0 ? (
              <li className="text-muted-foreground">Nenhum acesso.</li>
            ) : (
              membros.map((membro) => (
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
                  <button
                    type="button"
                    className="press text-sm font-medium text-primary"
                    onClick={() => void alternarAtivo(membro)}
                  >
                    {membro.ativo ? "Desativar" : "Reativar"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </Cartao>
      </div>
    </WebShell>
  );
}
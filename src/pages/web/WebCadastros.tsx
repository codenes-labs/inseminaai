import { FormEvent, useEffect, useState } from "react";
import { Botao, Cartao, inputClass } from "../../components/ui";
import {
  criarCadastroAutonomoApi,
  listarCadastrosPlataformaApi,
  type CadastroPlataforma,
} from "../../features/plataforma/infrastructure/plataforma-api";
import { WebShell } from "./WebShell";

export function WebCadastros() {
  const [lista, setLista] = useState<CadastroPlataforma[]>([]);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nomeCadastro, setNomeCadastro] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const dados = await listarCadastrosPlataformaApi();
      setLista(dados);
    } catch {
      setErro("Não foi possível carregar a lista.");
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
      await criarCadastroAutonomoApi({
        nomeCadastro,
        nomeUsuario,
        email,
        senha,
      });
      setSucesso("Cadastro autônomo criado. O usuário já pode entrar em /entrar.");
      setNomeCadastro("");
      setNomeUsuario("");
      setEmail("");
      setSenha("");
      await carregar();
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : "Erro ao criar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <WebShell titulo="Cadastros na plataforma">
      <div className="grid gap-8 lg:grid-cols-2">
        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Novo autônomo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cria o cadastro e o primeiro acesso (administrador do tenant).
          </p>
          <form className="mt-4 space-y-3" onSubmit={enviar}>
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
                type="password"
                className={`${inputClass} mt-1`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={8}
              />
            </label>
            {erro && <p className="text-sm text-status-vazia">{erro}</p>}
            {sucesso && <p className="text-sm text-brand">{sucesso}</p>}
            <Botao type="submit" disabled={salvando}>
              {salvando ? "Criando…" : "Criar cadastro"}
            </Botao>
          </form>
        </Cartao>

        <Cartao className="p-5">
          <h2 className="text-lg font-semibold">Cadastros existentes</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {lista.length === 0 ? (
              <li className="text-muted-foreground">Nenhum cadastro listado.</li>
            ) : (
              lista.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span className="font-medium">{item.nome}</span>
                  <span className="text-muted-foreground">
                    {item.tipo} · {item.plano}
                    {!item.ativa ? " · inativo" : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Cartao>
      </div>
    </WebShell>
  );
}
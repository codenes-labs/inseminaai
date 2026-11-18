import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import {
  Botao,
  Campo,
  CowIcon,
  Logo,
  OndasOvelha,
  inputClass,
} from "../components/ui";
import { MENSAGEM_LOGIN_INVALIDO, entrarComSenha } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const resultado = await entrarComSenha(identificador, senha);
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      navigate("/inicio");
    } catch {
      setErro(MENSAGEM_LOGIN_INVALIDO);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="bg-login relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden px-6">
      <div className="animate-in fade-in slide-in-from-bottom-3 relative z-10 flex flex-1 flex-col pt-16 duration-500">
        <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-(--shadow-fab)">
          <CowIcon className="size-9" />
        </div>
        <div className="text-3xl">
          <Logo icone={false} />
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          Registre suas inseminações com segurança
        </p>
        <form className="mt-10 space-y-4" onSubmit={enviar}>
          <Campo rotulo="E-mail" icone={<Mail className="size-5" strokeWidth={1.75} />}>
            <input
              type="email"
              autoComplete="username"
              placeholder="seu@email.com"
              className={inputClass}
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              disabled={carregando}
            />
          </Campo>
          <Campo rotulo="Senha" icone={<Lock className="size-5" strokeWidth={1.75} />}>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </Campo>
          {erro && (
            <p className="text-sm font-medium text-status-vazia">{erro}</p>
          )}
          <div className="flex justify-end">
            <a href="#esqueci" className="py-2 text-sm font-medium text-brand">
              Esqueci minha senha
            </a>
          </div>
          <Botao type="submit" disabled={carregando}>
            {carregando ? "Entrando…" : "Entrar"}
          </Botao>
          <p className="pt-2 text-center text-sm text-muted-foreground">
            Novos acessos são liberados pelo administrador.
          </p>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="font-medium text-brand">
            Voltar ao site
          </Link>
        </p>
      </div>
      <OndasOvelha />
    </div>
  );
}
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import {
  Botao,
  Campo,
  LeafIcon,
  Logo,
  OndasOvelha,
  inputClass,
} from "../components/ui";
import { credenciaisOk, gravarSessao } from "../lib/auth";

export function Login() {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [identificador, setIdentificador] = useState("vitor@fazenda.com.br");
  const [senha, setSenha] = useState("12345678");

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!credenciaisOk(identificador, senha)) {
      setErro("Não foi possível entrar. Confira os dados e tente de novo.");
      return;
    }
    gravarSessao(identificador);
    navigate("/inicio");
  }

  return (
    <div className="bg-login relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden px-6">
      <div className="animate-in fade-in slide-in-from-bottom-3 relative z-10 flex flex-1 flex-col pt-16 duration-500">
        <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-(--shadow-fab)">
          <LeafIcon className="size-8" />
        </div>
        <div className="text-3xl">
          <Logo />
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          Registre suas inseminações com segurança
        </p>
        <form className="mt-10 space-y-4" onSubmit={enviar}>
          <Campo rotulo="E-mail" icone={<Mail className="size-5" strokeWidth={1.75} />}>
            <input
              type="text"
              autoComplete="username"
              placeholder="seu@email.com"
              className={inputClass}
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
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
          <Botao type="submit">Entrar</Botao>
          <p className="pt-2 text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/inicio" className="font-semibold text-brand" onClick={() => gravarSessao("vitor@fazenda.com.br")}>
              Criar conta
            </Link>
          </p>
        </form>
      </div>
      <OndasOvelha />
    </div>
  );
}

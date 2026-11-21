import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import {
  Botao,
  Campo,
  CowIcon,
  Logo,
  OndasOvelha,
  inputClass,
} from "../components/ui";
import { TurnstileLogin } from "../components/TurnstileLogin";
import { useEntrar } from "../features/auth/presentation/use-entrar";
import type { ModoEntrada } from "../features/auth/domain/resolver-destino-pos-login";

export function Login({
  modo = "app",
  subtitulo = "Registre suas inseminações com segurança",
}: {
  modo?: ModoEntrada;
  subtitulo?: string;
}) {
  const {
    erro,
    carregando,
    identificador,
    setIdentificador,
    senha,
    setSenha,
    onTurnstileToken,
    enviar,
    turnstileSiteKey,
  } = useEntrar(modo);

  return (
    <div className="bg-login relative min-h-screen w-full">
      <div className="animate-in fade-in slide-in-from-bottom-3 relative z-10 mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden px-6">
        <div className="flex flex-1 flex-col pt-16 duration-500">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-(--shadow-fab)">
            <CowIcon className="size-9" />
          </div>
          <div className="text-3xl">
            <Logo icone={false} />
          </div>
          <p className="mt-2 text-base text-muted-foreground">{subtitulo}</p>
          {modo === "plataforma" ? (
            <div className="mt-4 space-y-2 rounded-xl border border-brand/30 bg-brand-soft/60 p-4 text-sm text-foreground">
              <p className="font-semibold text-primary">
                Só a equipe Codenes entra aqui
              </p>
              <p className="text-muted-foreground">
                Cliente ou inseminador criado no painel usa{" "}
                <Link to="/entrar" className="font-semibold text-brand">
                  /entrar
                </Link>{" "}
                (e-mail e senha definidos na criação do cadastro).
              </p>
            </div>
          ) : null}
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
            {turnstileSiteKey ? (
              <TurnstileLogin siteKey={turnstileSiteKey} onToken={onTurnstileToken} />
            ) : null}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Entrando…" : "Entrar"}
            </Botao>
            <p className="pt-2 text-center text-sm text-muted-foreground">
              {modo === "plataforma"
                ? "Acesso da plataforma: admin@codenes.com.br"
                : "Novos acessos são liberados pelo administrador."}
            </p>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link to="/" className="font-medium text-brand">
              Voltar ao site
            </Link>
          </p>
        </div>
        <OndasOvelha className="pointer-events-none -mx-6 mt-8 block w-[calc(100%+3rem)] lg:hidden" />
      </div>
      <OndasOvelha className="pointer-events-none fixed inset-x-0 bottom-0 z-0 hidden w-full lg:block" />
    </div>
  );
}
import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiSignOut } from "../../../lib/auth-api";
import {
  MENSAGEM_LOGIN_INVALIDO,
  entrarComSenha,
  lerSessao,
  limparSessao,
} from "../../../lib/auth";
import {
  desativarModoAppPlataforma,
  plataformaEmModoApp,
} from "../../../domain/auth/plataforma-modo-app";
import {
  contaPodeEntrarModoPlataforma,
  resolverDestinoPosLogin,
  type ModoEntrada,
} from "../domain/resolver-destino-pos-login";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

export function useEntrar(modo: ModoEntrada = "app") {
  const navigate = useNavigate();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const onTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (turnstileSiteKey && !turnstileToken) {
      setErro("Confirme o captcha antes de entrar.");
      return;
    }
    setCarregando(true);
    try {
      const resultado = await entrarComSenha(
        identificador,
        senha,
        turnstileToken || undefined,
      );
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      const sessao = lerSessao();
      if (!sessao) {
        setErro(MENSAGEM_LOGIN_INVALIDO);
        return;
      }
      if (
        modo === "plataforma" &&
        !contaPodeEntrarModoPlataforma(sessao.identificador)
      ) {
        limparSessao();
        void apiSignOut();
        setErro("Esta conta não tem acesso à administração da plataforma.");
        return;
      }
      if (modo === "plataforma") {
        desativarModoAppPlataforma();
      }
      const destino = resolverDestinoPosLogin(
        { identificador: sessao.identificador, papel: sessao.papel },
        modo,
        { modoAppPlataforma: plataformaEmModoApp() },
      );
      navigate(destino, { replace: true });
    } catch {
      setErro(MENSAGEM_LOGIN_INVALIDO);
    } finally {
      setCarregando(false);
    }
  }

  return {
    erro,
    carregando,
    identificador,
    setIdentificador,
    senha,
    setSenha,
    turnstileToken,
    onTurnstileToken,
    enviar,
    turnstileSiteKey,
    modo,
  };
}
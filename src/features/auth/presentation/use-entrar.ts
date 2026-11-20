import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MENSAGEM_LOGIN_INVALIDO, entrarComSenha, lerSessao } from "../../../lib/auth";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? "";

export function useEntrar() {
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
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (desktop && sessao?.plataformaAdmin) {
        navigate("/web/cadastros");
      } else if (desktop && sessao?.papel === "administrador") {
        navigate("/web/usuarios");
      } else {
        navigate("/inicio");
      }
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
  };
}
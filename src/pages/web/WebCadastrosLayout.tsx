import { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { emailEhAdminPlataformaCodenes } from "../../domain/auth/admin-plataforma-codenes";
import { desativarModoAppPlataforma } from "../../domain/auth/plataforma-modo-app";
import {
  listarCadastrosPlataformaApi,
  type CadastroPlataforma,
} from "../../features/plataforma/infrastructure/plataforma-api";
import { apiFetch } from "../../lib/api-client";
import { lerSessao } from "../../lib/auth";
import { WebShell } from "./WebShell";

export type WebCadastrosLayoutContext = {
  lista: CadastroPlataforma[];
  erroLista: string;
  recarregarListaCadastros: () => Promise<void>;
};

export function WebCadastrosLayout() {
  const [lista, setLista] = useState<CadastroPlataforma[]>([]);
  const [erroLista, setErroLista] = useState("");
  const [sessaoNegada, setSessaoNegada] = useState(false);

  const carregar = useCallback(async () => {
    const sessaoLocal = lerSessao();
    if (!emailEhAdminPlataformaCodenes(sessaoLocal?.email)) {
      setSessaoNegada(true);
      return;
    }
    const sessaoResposta = await apiFetch("/api/auth/session");
    if (!sessaoResposta.ok) {
      setLista([]);
      setErroLista("Sessão expirada. Entre de novo.");
      return;
    }
    const sessaoCorpo = (await sessaoResposta.json()) as {
      user?: { email?: string };
    };
    if (!emailEhAdminPlataformaCodenes(sessaoCorpo.user?.email)) {
      setSessaoNegada(true);
      return;
    }

    let mensagem = "Não foi possível carregar a lista.";
    for (let tentativa = 0; tentativa < 2; tentativa++) {
      try {
        const dados = await listarCadastrosPlataformaApi();
        setLista(dados);
        setErroLista("");
        return;
      } catch (erro) {
        if (erro instanceof Error && erro.message.trim()) {
          mensagem = erro.message;
        }
        if (tentativa === 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    }
    setLista([]);
    setErroLista(mensagem);
  }, []);

  useEffect(() => {
    desativarModoAppPlataforma();
    void carregar();
  }, [carregar]);

  if (sessaoNegada) {
    return <Navigate to="/inicio" replace />;
  }

  return (
    <WebShell titulo="Cadastros na plataforma">
      <Outlet
        context={{
          lista,
          erroLista,
          recarregarListaCadastros: carregar,
        }}
      />
    </WebShell>
  );
}
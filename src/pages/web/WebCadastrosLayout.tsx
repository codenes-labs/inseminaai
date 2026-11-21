import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { desativarModoAppPlataforma } from "../../domain/auth/plataforma-modo-app";
import {
  listarCadastrosPlataformaApi,
  type CadastroPlataforma,
} from "../../features/plataforma/infrastructure/plataforma-api";
import { WebShell } from "./WebShell";

export type WebCadastrosLayoutContext = {
  lista: CadastroPlataforma[];
  erroLista: string;
  recarregarListaCadastros: () => Promise<void>;
};

export function WebCadastrosLayout() {
  const [lista, setLista] = useState<CadastroPlataforma[]>([]);
  const [erroLista, setErroLista] = useState("");

  const carregar = useCallback(async () => {
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
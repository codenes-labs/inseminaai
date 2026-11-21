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
    try {
      const dados = await listarCadastrosPlataformaApi();
      setLista(dados);
      setErroLista("");
    } catch {
      setErroLista("Não foi possível carregar a lista.");
    }
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
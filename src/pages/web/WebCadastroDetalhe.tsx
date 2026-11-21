import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Cartao } from "../../components/ui";
import {
  listarCadastrosPlataformaApi,
  type CadastroPlataforma,
} from "../../features/plataforma/infrastructure/plataforma-api";
import { WebShell } from "./WebShell";

export function WebCadastroDetalhe() {
  const { cadastroId } = useParams<{ cadastroId: string }>();
  const [item, setItem] = useState<CadastroPlataforma | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    void (async () => {
      if (!cadastroId) {
        setErro("Cadastro inválido.");
        return;
      }
      try {
        const lista = await listarCadastrosPlataformaApi();
        const encontrado = lista.find((c) => c.id === cadastroId) ?? null;
        setItem(encontrado);
        if (!encontrado) {
          setErro("Cadastro não encontrado.");
        }
      } catch {
        setErro("Não foi possível carregar o cadastro.");
      }
    })();
  }, [cadastroId]);

  return (
    <WebShell titulo="Detalhe do cadastro">
      <p className="mb-4">
        <Link to="/admin/cadastros" className="text-sm font-semibold text-primary">
          ← Voltar à lista
        </Link>
      </p>
      {erro ? (
        <p className="text-sm text-status-vazia">{erro}</p>
      ) : item ? (
        <Cartao className="space-y-2 p-5 text-sm">
          <p>
            <span className="font-semibold">Nome: </span>
            {item.nome}
          </p>
          <p>
            <span className="font-semibold">Tipo: </span>
            {item.tipo}
          </p>
          <p>
            <span className="font-semibold">Plano: </span>
            {item.plano}
          </p>
          <p>
            <span className="font-semibold">Status: </span>
            {item.ativa ? "Ativo" : "Inativo"}
          </p>
          <p>
            <span className="font-semibold">ID: </span>
            <span className="font-mono text-xs">{item.id}</span>
          </p>
        </Cartao>
      ) : (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      )}
    </WebShell>
  );
}
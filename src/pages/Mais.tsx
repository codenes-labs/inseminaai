import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Settings } from "lucide-react";
import { AppShell, Botao, Cartao } from "../components/ui";
import { ehAdminPlataformaCodenes } from "../domain/auth/admin-plataforma-codenes";
import {
  desativarModoAppPlataforma,
  plataformaEmModoApp,
} from "../domain/auth/plataforma-modo-app";
import { lerSessao, sair } from "../lib/auth";

const linksCadastrosAuxiliares = [
  { to: "/mais/reprodutores", rotulo: "Reprodutores" },
  { to: "/mais/inseminadores", rotulo: "Inseminadores" },
  { to: "/mais/lotes", rotulo: "Lotes" },
] as const;

function GrupoLinks({
  titulo,
  links,
}: {
  titulo: string;
  links: readonly { to: string; rotulo: string }[];
}) {
  return (
    <Cartao className="divide-y divide-border p-0">
      <p className="px-4 pb-2 pt-4 text-sm font-semibold text-muted-foreground">
        {titulo}
      </p>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="press flex min-h-12 items-center justify-between px-4 text-foreground"
        >
          <span className="font-medium">{link.rotulo}</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      ))}
    </Cartao>
  );
}

export function Mais() {
  const navigate = useNavigate();
  const sessao = lerSessao();

  function encerrar() {
    sair();
    navigate("/entrar");
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-2 bg-primary px-4 text-primary-foreground">
        <h1 className="text-lg font-semibold">Mais</h1>
      </header>
      <div className="space-y-3 px-4 py-4">
        <Cartao className="p-4">
          <p className="text-sm text-muted-foreground">Conectado como</p>
          <p className="text-lg font-semibold">{sessao?.nome ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{sessao?.identificador}</p>
        </Cartao>
        {ehAdminPlataformaCodenes(sessao) && plataformaEmModoApp() ? (
          <Cartao className="divide-y divide-border p-0">
            <p className="px-4 pb-2 pt-4 text-sm font-semibold text-muted-foreground">
              Administrativo
            </p>
            <Link
              to="/admin/cadastros"
              className="press flex min-h-12 items-center justify-between px-4 text-foreground"
              onClick={() => desativarModoAppPlataforma()}
            >
              <span className="font-medium">Clientes na plataforma</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Cartao>
        ) : null}
        {sessao?.papel === "administrador" && !sessao.plataformaAdmin ? (
          <Cartao className="divide-y divide-border p-0">
            <p className="px-4 pb-2 pt-4 text-sm font-semibold text-muted-foreground">
              Equipe
            </p>
            <Link
              to="/mais/acessos"
              className="press flex min-h-12 items-center justify-between px-4 text-foreground"
            >
              <span className="font-medium">Gestão de logins</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Cartao>
        ) : null}
        <GrupoLinks
          titulo="Cadastros auxiliares"
          links={linksCadastrosAuxiliares}
        />
        <Cartao className="divide-y divide-border p-0">
          <p className="px-4 pb-2 pt-4 text-sm font-semibold text-muted-foreground">
            Sistema
          </p>
          <Link
            to="/mais/configuracoes"
            className="press flex min-h-12 items-center justify-between gap-3 px-4 text-foreground"
          >
            <span className="flex items-center gap-3">
              <Settings className="size-5 text-muted-foreground" />
              <span className="font-medium">Configurações</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </Cartao>
        <Botao variante="suave" onClick={encerrar}>
          Sair
        </Botao>
      </div>
    </AppShell>
  );
}
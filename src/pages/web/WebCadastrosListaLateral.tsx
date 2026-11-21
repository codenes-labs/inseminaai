import { NavLink } from "react-router-dom";
import { Cartao } from "../../components/ui";
import { desativarModoAppPlataforma } from "../../domain/auth/plataforma-modo-app";
import { cadastroProtegidoSistema } from "../../features/plataforma/domain/cadastros-sistema";
import type { CadastroPlataforma } from "../../features/plataforma/infrastructure/plataforma-api";

export function WebCadastrosListaLateral({
  lista,
  erro,
}: {
  lista: CadastroPlataforma[];
  erro: string;
}) {
  return (
    <Cartao className="h-fit p-4 lg:sticky lg:top-4">
      <h2 className="text-lg font-semibold">Cadastros</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Clique para abrir o cliente.
      </p>
      {erro ? <p className="mt-2 text-sm text-status-vazia">{erro}</p> : null}
      <ul className="mt-3 max-h-[min(70dvh,32rem)] space-y-1 overflow-y-auto text-sm">
        <li>
          <NavLink
            to="/admin/cadastros"
            end
            onClick={() => desativarModoAppPlataforma()}
            className={({ isActive }) =>
              `press block rounded-lg px-3 py-2 font-medium ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            + Novo cadastro
          </NavLink>
        </li>
        {lista.length === 0 ? (
          <li className="px-3 py-2 text-muted-foreground">Nenhum cadastro.</li>
        ) : (
          lista.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/admin/cadastros/${item.id}`}
                className={({ isActive }) =>
                  `press block rounded-lg px-3 py-2 ${
                    isActive
                      ? "bg-primary/15 font-semibold text-primary"
                      : "hover:bg-muted"
                  }`
                }
              >
                <span className="block font-medium">{item.nome}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {cadastroProtegidoSistema(item.id) ? "sistema · " : ""}
                  {item.tipo}
                  {!item.ativa ? " · inativo" : ""}
                </span>
              </NavLink>
            </li>
          ))
        )}
      </ul>
    </Cartao>
  );
}
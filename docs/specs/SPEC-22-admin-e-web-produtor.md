# SPEC-22 — Admin da plataforma vs web do produtor

**Objetivo:** separar **plataforma** (`admin@codenes.com.br`) do **app do produtor** no desktop, no espírito In House Bank.

## Rotas

| Quem | O quê | Rotas |
| --- | --- | --- |
| **Plataforma** (`plataforma_admin`) | Clientes e logins dos clientes | `/admin/entrar`, `/admin/cadastros`, `/admin/cadastros/:id` |
| **Dono / admin do cadastro** | App (matrizes, inseminação, etc.) + acessos da equipe | `/inicio`, …, `/mais/acessos` |
| **Inseminador** | App | `/inicio`, … |

`/web/*` redireciona para `/admin/*` ou `/mais/acessos` (compatibilidade).

## Login

- `/entrar` — produtores e equipe; pós-login → `/inicio` (qualquer viewport).
- `/admin/entrar` — só contas com `plataforma_admin`; demais veem erro e não entram.
- `plataforma_admin` em `/entrar` → `/admin/cadastros`.
- Conta plataforma **não** usa rotas do app (`/inicio`, …) — redireciona para `/admin/cadastros`.

## Web do produtor (desktop)

- Viewport `lg+` (≥1024px): **menu lateral** com as mesmas destinos da barra inferior (Início, Matrizes, Relatórios, Mais, Nova inseminação).
- Mobile: **inalterado** (`max-w-[480px]`, barra inferior).
- Mesmas páginas e APIs; só o chrome muda.

## Acessos da equipe (tenant)

- Administrador do cadastro: `/mais/acessos` (Gestão de logins do tenant).
- Não aparece no menu da plataforma.

## Critérios de aceite

- [x] Admin plataforma abre só `/admin/*`.
- [x] Admin fazenda no desktop vê sidebar e `/inicio` após login.
- [x] `/web/cadastros` → redirect `/admin/cadastros`.
- [x] Testes unitários em `resolver-destino-pos-login`.

## Estado

**Implementado (2026-11-20).** Menu lateral desktop (`LayoutDesktopProdutor`), rotas `/admin/*`, `/mais/acessos`, redirects `/web/*`.
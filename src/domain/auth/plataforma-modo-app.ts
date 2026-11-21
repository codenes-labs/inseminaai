const STORAGE_KEY = "inseminaai_plataforma_modo_app";

/** Admin da plataforma pode abrir o app do produtor (preview/campo) por escolha explícita. */
export function ativarModoAppPlataforma(): void {
  sessionStorage.setItem(STORAGE_KEY, "1");
}

export function desativarModoAppPlataforma(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function plataformaEmModoApp(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}
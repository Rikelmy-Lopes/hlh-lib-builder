import { ask } from "@tauri-apps/plugin-dialog";

export async function shouldStart() {
  return await ask("Começar a executar?", { kind: "warning" });
}

import { ask, message, open } from "@tauri-apps/plugin-dialog";

export async function shouldStart() {
  return await ask("Começar a executar?", { kind: "warning" });
}

export async function chooseFolder(setState: React.Dispatch<React.SetStateAction<string>>) {
  const folder = await open({ directory: true });
  if (folder === null) return;
  setState(folder);
}

export async function displaySuccessfulDialog() {
  await message("Concluído com sucesso!", { kind: "info" });
}

export async function displayErrorDialog(error: string) {
  await message("Algo deu errado\n" + error, { kind: "error" });
}

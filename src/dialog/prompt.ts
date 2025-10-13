import { ask, message, open } from "@tauri-apps/plugin-dialog";

export async function shouldStart() {
  return await ask("Começar a executar?", { kind: "warning" });
}

export async function shouldStop() {
  return await ask("Tem certeza que deseja parar?", { kind: "warning" });
}

export async function shouldUseRecentFile() {
  return await ask(
    "Um arquivo '.jar' ja existe no caminho de origem\nDeseja reutilizar ou criar um novo? ",
    {
      kind: "warning",
      okLabel: "Reutilizar",
      cancelLabel: "Criar um novo",
    }
  );
}

export async function chooseFolder(setState: React.Dispatch<React.SetStateAction<string>>) {
  const folder = await open({ directory: true });
  if (folder === null) return;
  setState(folder);
}

export async function showSuccessDialog() {
  await message("Concluído com sucesso!", { kind: "info" });
}

export async function showCancelDialog() {
  await message("Execução parada!", { kind: "info" });
}

export async function showErrorDialog(error: string) {
  await message(`Algo deu errado:\n${error}`, { kind: "error" });
}

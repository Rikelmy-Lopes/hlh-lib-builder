import { exists, copyFile } from "@tauri-apps/plugin-fs";

export async function pathExists(path: string) {
  return await exists(path);
}

export async function copyBuildFileToDestination(
  origem: string,
  destino: string
) {
  const fullOrigemPath = origem + "\\dist\\SIGP_INT.jar";
  const fullDestinoPath =
    destino + "\\src\\main\\webapp\\WEB-INF\\lib\\SIGP_INT.jar";
  await copyFile(fullOrigemPath, fullDestinoPath);
}

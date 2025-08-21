import { exists, copyFile } from "@tauri-apps/plugin-fs";
import { DESTINATION_LIB_PATH } from "../constants/constants";

export async function pathExists(path: string) {
  return await exists(path);
}

export async function copyBuildFileToDestination(origem: string, destino: string) {
  const fullOrigemPath = origem + "\\dist\\SIGP_INT.jar";
  const fullDestinoPath = destino + DESTINATION_LIB_PATH + "\\SIGP_INT.jar";
  await copyFile(fullOrigemPath, fullDestinoPath);
}

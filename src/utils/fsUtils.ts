import { copyFile } from "@tauri-apps/plugin-fs";
import { DESTINATION_LIB_PATH } from "../constants/constants";
import { join } from "@tauri-apps/api/path";
import { writeLog } from "./log";

export async function copyBuildFileToDestination(origem: string, destino: string) {
  const jarFileName = "SIGP_INT.jar";
  const fullOrigemPath = await join(origem, "dist", jarFileName);
  const fullDestinoPath = await join(destino, DESTINATION_LIB_PATH, jarFileName);
  try {
    await copyFile(fullOrigemPath, fullDestinoPath);
  } catch (e) {
    console.error("Failed copying jar file: ", e);
    writeLog("[ERROR]" + " ->> " + (e as Error).message);
  }
}

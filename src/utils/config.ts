import { appLocalDataDir, BaseDirectory } from "@tauri-apps/api/path";
import { pathExists } from "./fsUtils";
import { mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export async function saveConfig(origem: string, destino: string) {
  const appConfigDirectory = (await appLocalDataDir()) + "\\config";
  const settings = {
    origem,
    destino,
  };

  if (!(await pathExists(appConfigDirectory))) {
    await mkdir("config", { baseDir: BaseDirectory.AppLocalData });
  }

  await writeTextFile("config/settings.json", JSON.stringify(settings), {
    baseDir: BaseDirectory.AppLocalData,
  });
}

export async function loadConfig(): Promise<{
  origem: string;
  destino: string;
}> {
  try {
    const data = await readTextFile("config/settings.json", {
      baseDir: BaseDirectory.AppLocalData,
    });

    return JSON.parse(data);
  } catch {
    return { origem: "", destino: "" };
  }
}

import { BaseDirectory } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const CONFIG_FILE = "config/settings.json";

export async function saveConfig(origem: string, destino: string) {
  const settings = {
    origem,
    destino,
  };

  if (!(await exists("config", { baseDir: BaseDirectory.AppLocalData }))) {
    await mkdir("config", { baseDir: BaseDirectory.AppLocalData });
  }

  await writeTextFile(CONFIG_FILE, JSON.stringify(settings), {
    baseDir: BaseDirectory.AppLocalData,
  });
}

export async function loadConfig(): Promise<{ origem: string; destino: string }> {
  try {
    const data = await readTextFile(CONFIG_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });

    return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to load config:", e);
    return { origem: "", destino: "" };
  }
}

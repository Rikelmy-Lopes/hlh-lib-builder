import { BaseDirectory } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { CONFIG_FILE } from "../constants/constants";
import { warn } from "@tauri-apps/plugin-log";

export async function saveConfig(sourceProject: string, targetProject: string) {
  const settings = {
    sourceProject,
    targetProject,
  };
  try {
    if (!(await exists("config", { baseDir: BaseDirectory.AppLocalData }))) {
      await mkdir("config", { baseDir: BaseDirectory.AppLocalData });
    }

    await writeTextFile(CONFIG_FILE, JSON.stringify(settings), {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch (e) {
    console.warn("Failed saving config: ", e);
    warn(`Failed saving config: ${(e as Error).message}`);
  }
}

export async function loadConfig(): Promise<{ sourceProject: string; targetProject: string }> {
  try {
    if (!(await exists(CONFIG_FILE, { baseDir: BaseDirectory.AppLocalData }))) {
      return { sourceProject: "", targetProject: "" };
    }
    const data = await readTextFile(CONFIG_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });

    return JSON.parse(data);
  } catch (e) {
    console.warn("Failed loading config:", e);
    warn(`Failed loading config: ${(e as Error).message}`);
    return { sourceProject: "", targetProject: "" };
  }
}

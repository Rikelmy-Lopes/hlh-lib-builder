import { appLogDir } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  mkdir,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

export async function pathExists(path: string) {
  return await exists(path);
}

export async function writeLog(contents: unknown) {
  const appLogDirectory = await appLogDir();
  const log =
    new Date().toLocaleString() + " - " + JSON.stringify(contents) + "\n\n";
  if (!(await pathExists(appLogDirectory))) {
    await mkdir(".", { baseDir: BaseDirectory.AppLog });
  }
  await writeTextFile("logs.txt", log, {
    append: true,
    baseDir: BaseDirectory.AppLog,
  });
}

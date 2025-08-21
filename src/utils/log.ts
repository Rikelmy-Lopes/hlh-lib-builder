import { appLogDir, BaseDirectory } from "@tauri-apps/api/path";
import { mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { pathExists } from "./fsUtils";
import { SEPARATOR } from "../constants/constants";

export async function writeLog(log: string) {
  const appLogDirectory = await appLogDir();
  const formattedLog = new Date().toLocaleString() + " - " + log + "\n" + SEPARATOR;

  if (!(await pathExists(appLogDirectory))) {
    await mkdir(".", { baseDir: BaseDirectory.AppLog });
  }

  await writeTextFile("logs.txt", formattedLog, {
    append: true,
    baseDir: BaseDirectory.AppLog,
  });
}

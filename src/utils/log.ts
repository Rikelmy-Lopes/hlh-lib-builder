import { BaseDirectory } from "@tauri-apps/api/path";
import { exists, mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { SEPARATOR } from "../constants/constants";

export async function writeLog(log: string) {
  const formattedLog = new Date().toLocaleString() + " - " + log + "\n" + SEPARATOR;

  if (!(await exists(".", { baseDir: BaseDirectory.AppLog }))) {
    await mkdir(".", { baseDir: BaseDirectory.AppLog });
  }

  await writeTextFile("logs.txt", formattedLog, {
    append: true,
    baseDir: BaseDirectory.AppLog,
  });
}

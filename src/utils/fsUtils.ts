import { copyFile } from "@tauri-apps/plugin-fs";
import { DESTINATION_LIB_PATH, JAR_FILE_NAME } from "../constants/constants";
import { join } from "@tauri-apps/api/path";
import { error } from "@tauri-apps/plugin-log";

export async function copyBuildFileToDestination(sourceProject: string, targetProject: string) {
  try {
    const fullSourceProjectPath = await join(sourceProject, "dist", JAR_FILE_NAME);
    const fullTargetProjectPath = await join(targetProject, DESTINATION_LIB_PATH, JAR_FILE_NAME);
    await copyFile(fullSourceProjectPath, fullTargetProjectPath);
    return true;
  } catch (e) {
    console.error("Failed copying jar file: ", e);
    error(`Failed copying jar file: ${(e as Error).message}`);
    return false;
  }
}

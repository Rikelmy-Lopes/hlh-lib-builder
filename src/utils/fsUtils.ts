import { copyFile, stat } from "@tauri-apps/plugin-fs";
import { DESTINATION_LIB_PATH, JAR_FILE_NAME } from "../constants/constants";
import { join } from "@tauri-apps/api/path";
import { error, warn } from "@tauri-apps/plugin-log";

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

export async function isBuildFileRecent(sourceProject: string) {
  const millisecondsInTwoDays = 2 * 24 * 60 * 60 * 1000;
  try {
    const fullSourceProjectPath = await join(sourceProject, "dist", JAR_FILE_NAME);
    const fileInfo = await stat(fullSourceProjectPath);

    if (!fileInfo.birthtime) {
      return false;
    }

    const now = new Date();
    const isNewerThanTwoDays = now.getTime() - fileInfo.birthtime.getTime() < millisecondsInTwoDays;

    return isNewerThanTwoDays;
  } catch (e) {
    console.warn("An error occurred: ", e);
    warn(`An error occurred: ${(e as Error).message}`);
    return false;
  }
}

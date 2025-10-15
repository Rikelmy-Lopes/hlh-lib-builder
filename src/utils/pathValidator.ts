import { exists } from "@tauri-apps/plugin-fs";
import { BUILD_EXTENSION, DESTINATION_LIB_PATH, ERROR_MESSAGES } from "../constants/constants";
import { join } from "@tauri-apps/api/path";

export async function validatePaths(sourceProject: string, targetProject: string): Promise<string | null> {
  if (!sourceProject || !targetProject) {
    return ERROR_MESSAGES.PATHS_EMPTY;
  }

  const buildXmlPath = await join(sourceProject, BUILD_EXTENSION);
  const destinationLibPath = await join(targetProject, DESTINATION_LIB_PATH);

  if (!(await exists(buildXmlPath))) {
    return ERROR_MESSAGES.BUILD_XML_NOT_FOUND;
  }

  if (!(await exists(destinationLibPath))) {
    return ERROR_MESSAGES.DESTINATION_NOT_FOUND;
  }

  return null;
}

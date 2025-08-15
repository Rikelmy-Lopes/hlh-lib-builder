import { exists } from "@tauri-apps/plugin-fs";

export async function pathExists(path: string) {
    return await exists(path)
}
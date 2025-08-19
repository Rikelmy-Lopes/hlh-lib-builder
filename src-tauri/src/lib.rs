mod config;
use crate::config::global::{ANT_COMMAND, ANT_RESOURCE_PATH, BUILD_EXTENSION};
use std::thread;
use std::{path::PathBuf, process::Command};
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::{AppHandle, Emitter};

fn resolve_ant_path(handle: &AppHandle) -> Option<PathBuf> {
    let path = format!("{}{}", ANT_RESOURCE_PATH, ANT_COMMAND);
    match handle.path().resolve(path, BaseDirectory::Resource) {
        Ok(path) => Some(path),
        Err(e) => {
            eprintln!("Falha ao resolver caminho do recurso: {}", e);
            None
        }
    }
}

fn spawn_ant_build(handle: &AppHandle, project_path: String, ant_path: String) {
    let handle = handle.clone();
    thread::spawn(move || {
        let output = Command::new(&ant_path)
            .args(["-q", "-f", &project_path, "clean", "jar"])
            /* .args(["-version"]) */
            .env_remove("ANT_HOME")
            .output()
            .expect("Falha ao executar o Apache Ant. Verifique se o caminho está correto.");

        let msg = format!(
            "{}{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        handle.emit("command-complete", msg)
    });
}

#[tauri::command]
fn run_command(handle: AppHandle, origem: String) {
    let project_path = format!("{}\\{}", origem, BUILD_EXTENSION);

    match resolve_ant_path(&handle) {
        Some(path) => spawn_ant_build(&handle, project_path, path.display().to_string()),
        None => {
            eprintln!("Falha ao encontrar o binario do Ant!");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

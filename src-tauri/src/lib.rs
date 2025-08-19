mod config;
use crate::config::global::{ANT_COMMAND, ANT_RESOURCE_PATH, BUILD_EXTENSION};
use std::thread;
use std::{path::PathBuf, process::Command};
use tauri::path::BaseDirectory;
use tauri::Manager;
use tauri::{AppHandle, Emitter};

fn resolve_resource_path(handle: &AppHandle, path: String) -> Option<PathBuf> {
    match handle.path().resolve(path, BaseDirectory::Resource) {
        Ok(path) => Some(path),
        Err(_e) => None,
    }
}

fn execute_build(handle: &AppHandle, project_path: String, ant_path: String) -> () {
    let handle = handle.clone();
    thread::spawn(move || {
        let output = Command::new(&ant_path.to_string())
            .args(["-q", "-f", &project_path, "clean", "jar"])
            /* .args(["-version"]) */
            .env_remove("ANT_HOME")
            .output()
            .expect("Failed to execute Ant");

        let mut msg = String::new();
        msg.push_str(&String::from_utf8_lossy(&output.stdout));
        msg.push_str(&String::from_utf8_lossy(&output.stderr));
        handle.emit("command-complete", msg)
    });
}

#[tauri::command]
fn execute(handle: AppHandle, origem: String) -> () {
    let project_path = format!("{}\\{}", origem, BUILD_EXTENSION);

    match resolve_resource_path(&handle, format!("{}{}", ANT_RESOURCE_PATH, ANT_COMMAND)) {
        Some(path) => execute_build(&handle, project_path, path.display().to_string()),
        None => {
            println!("Falha ao encontrar o binario do ant!");
            "Falha ao encontrar o binario do ant!".to_string();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![execute])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod config;
use crate::config::global::{ANT_COMMAND, ANT_RESOURCE_PATH, BUILD_EXTENSION};
use std::sync::mpsc;
use std::thread;
use std::{path::PathBuf, process::Command};
use tauri::path::BaseDirectory;
use tauri::Manager;

fn resolve_resource_path(handle: tauri::AppHandle, path: String) -> Option<PathBuf> {
    match handle.path().resolve(path, BaseDirectory::Resource) {
        Ok(path) => Some(path),
        Err(_e) => None,
    }
}

fn execute_build(project_path: String, ant_path: String) -> String {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let output = Command::new(&ant_path.to_string())
            /* .args(["-q", "-f", &project_path, "clean", "jar"]) */
            .args(["-version"])
            .env_remove("ANT_HOME")
            .output()
            .expect("Failed to execute Ant");

        let mut msg = String::new();
        msg.push_str(&String::from_utf8_lossy(&output.stdout));
        msg.push_str(&String::from_utf8_lossy(&output.stderr));

        tx.send(msg).unwrap();
    });
    rx.recv().unwrap()
}

#[tauri::command]
fn execute(handle: tauri::AppHandle, origem: String) -> String {
    let project_path = format!("{}\\{}", origem, BUILD_EXTENSION);

    match resolve_resource_path(handle, format!("{}{}", ANT_RESOURCE_PATH, ANT_COMMAND)) {
        Some(path) => {
            println!("Project path: {}", project_path);
            println!("Apache Ant path: {}", path.display());
            execute_build(project_path, path.to_str().unwrap().to_string())
        }
        None => {
            println!("Falha ao encontrar o binario do ant!");
            "Falha ao encontrar o binario do ant!".to_string()
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

mod config;
mod utils;
use crate::{
    config::constants::{
        ANT_COMMAND, ANT_EVENT_COMPLETE_SUCCESSFUL, ANT_EVENT_COMPLETE_WITH_ERROR,
        ANT_RESOURCE_PATH, SEVEN_ZIP_RESOURCE_PATH, _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
    },
    utils::{
        commands::{spawn_7zip, spawn_ant_build},
        path::resolve_resource_path,
    },
};
use std::thread;
use std::{path::PathBuf, process::Output};
use tauri::{AppHandle, Emitter};

fn format_output(output: &Output) -> String {
    format!(
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    )
}

fn is_build_successful(output: &str) -> bool {
    output.contains("BUILD SUCCESSFUL")
}

fn spawn_commands(handle: AppHandle, origem: String) {
    let ant_path = PathBuf::from(ANT_RESOURCE_PATH).join(ANT_COMMAND);
    let seven_zip_path = PathBuf::from(SEVEN_ZIP_RESOURCE_PATH);

    thread::spawn(move || {
        match resolve_resource_path(&handle, &ant_path) {
            Some(path) => {
                let output = spawn_ant_build(&path, &origem);
                let formatted_output = format_output(&output);

                if !is_build_successful(&formatted_output) {
                    let _ = handle.emit(ANT_EVENT_COMPLETE_WITH_ERROR, formatted_output);
                    return;
                }

                let _ = handle.emit(ANT_EVENT_COMPLETE_SUCCESSFUL, formatted_output);
            }
            None => {
                eprintln!("Falha ao encontrar o binario do Ant!");
                let _ = handle.emit("log", "Falha ao encontrar o binario do Ant!");
            }
        }

        match resolve_resource_path(&handle, &seven_zip_path) {
            Some(path) => {
                let output = spawn_7zip(&path, &origem);
                let formatted_output = format_output(&output);

                let _ = handle.emit(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, formatted_output);
            }
            None => {
                eprintln!("Falha ao encontrar o binario do 7zip!");
                let _ = handle.emit("log", "Falha ao encontrar o binario do 7zip!");
            }
        }
    });
}

#[tauri::command]
fn start(handle: AppHandle, origem: String) {
    spawn_commands(handle, origem);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![start])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

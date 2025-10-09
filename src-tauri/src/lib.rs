mod config;
mod utils;
use crate::{
    config::constants::{
        ANT_COMMAND, ANT_EVENT_COMPLETE_SUCCESSFUL, ANT_EVENT_COMPLETE_WITH_ERROR,
        ANT_RESOURCE_PATH, EVENT_CANCEL_RECEIVED, EVENT_CANCEL_SENT, EVENT_RESOURCE_ERROR,
        SEVEN_ZIP_RESOURCE_PATH, _7ZIP_EVENT_COMPLETE_SUCCESSFUL, _7ZIP_EVENT_COMPLETE_WITH_ERROR,
    },
    utils::{
        arc_mutex::{lock_arc_mutex, new_arc_mutex, read_arc_mutex},
        commands::{kill_process, spawn_7zip, spawn_ant_build},
        output::{format_output, is_7zip_successful, is_build_successful},
        path::resolve_resource_path,
    },
};
use log::LevelFilter;
use std::thread;
use std::{path::PathBuf, sync::Arc};
use tauri::Listener;
use tauri::{AppHandle, Emitter};
use tauri_plugin_log::TimezoneStrategy;

fn spawn_commands(handle: AppHandle, source_project: String) {
    let ant_path = PathBuf::from(ANT_RESOURCE_PATH).join(ANT_COMMAND);
    let seven_zip_path = PathBuf::from(SEVEN_ZIP_RESOURCE_PATH);
    let is_killed = new_arc_mutex(false);
    let is_killed_clone = Arc::clone(&is_killed);

    thread::spawn(move || {
        match resolve_resource_path(&handle, &ant_path) {
            Some(path) => {
                let child = spawn_ant_build(&path, &source_project);
                let pid = child.id();

                let cancel_listener = handle.listen(EVENT_CANCEL_SENT, move |_e| {
                    let mut is_killed = lock_arc_mutex(&is_killed);
                    *is_killed = kill_process(&pid);
                });

                let formatted_output = format_output(child.wait_with_output().unwrap());
                let is_killed = read_arc_mutex(&is_killed_clone);

                if is_killed {
                    let _ = handle.emit(EVENT_CANCEL_RECEIVED, "payload");
                } else if !is_build_successful(&formatted_output) {
                    let _ = handle.emit(ANT_EVENT_COMPLETE_WITH_ERROR, &formatted_output);
                } else {
                    let _ = handle.emit(ANT_EVENT_COMPLETE_SUCCESSFUL, &formatted_output);
                }

                handle.unlisten(cancel_listener);
                if is_killed || !is_build_successful(&formatted_output) {
                    return;
                }
            }
            None => {
                let _ = handle.emit(EVENT_RESOURCE_ERROR, "Falha ao encontrar o binario do Ant!");
                return;
            }
        }

        match resolve_resource_path(&handle, &seven_zip_path) {
            Some(path) => {
                let is_killed_clone2 = Arc::clone(&is_killed_clone);
                let child = spawn_7zip(&path, &source_project);
                let pid = child.id();

                let cancel_listener = handle.listen(EVENT_CANCEL_SENT, move |_e| {
                    let mut is_killed = lock_arc_mutex(&is_killed_clone);
                    *is_killed = kill_process(&pid);
                });

                let formatted_output = format_output(child.wait_with_output().unwrap());
                let is_killed = read_arc_mutex(&is_killed_clone2);

                if is_killed {
                    let _ = handle.emit(EVENT_CANCEL_RECEIVED, "payload");
                } else if !is_7zip_successful(&formatted_output) {
                    let _ = handle.emit(_7ZIP_EVENT_COMPLETE_WITH_ERROR, formatted_output);
                } else {
                    let _ = handle.emit(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, formatted_output);
                }

                handle.unlisten(cancel_listener);
            }
            None => {
                let _ = handle.emit(
                    EVENT_RESOURCE_ERROR,
                    "Falha ao encontrar o binario do 7zip!",
                );
                return;
            }
        }
    });
}

#[tauri::command]
fn start(handle: AppHandle, source_project: String) {
    spawn_commands(handle, source_project);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .max_file_size(50_000)
                .level(LevelFilter::Info)
                .timezone_strategy(TimezoneStrategy::UseLocal)
                .filter(|metadata| {
                    metadata.target() != "tao::platform_impl::platform::event_loop::runner"
                })
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![start])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod config;
mod utils;
use crate::{
    config::constants::{
        get_global, ANT_COMMAND, ANT_EVENT_COMPLETE_SUCCESSFUL, ANT_EVENT_COMPLETE_WITH_ERROR,
        ANT_RESOURCE_PATH, EVENT_RESOURCE_ERROR, IDS_LISTENERS, SEVEN_ZIP_RESOURCE_PATH,
        _7ZIP_EVENT_COMPLETE_SUCCESSFUL, _7ZIP_EVENT_COMPLETE_WITH_ERROR,
    },
    utils::{
        commands::{kill_process, spawn_7zip, spawn_ant_build},
        output::{format_output, is_7zip_successful, is_build_successful},
        path::resolve_resource_path,
    },
};
use log::LevelFilter;
use std::thread;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};
use tauri::Listener;
use tauri::{AppHandle, Emitter};
use tauri_plugin_log::TimezoneStrategy;

fn remove_listeners(handle: &AppHandle) {
    get_global(&IDS_LISTENERS, |ids| {
        for id in ids.into_iter() {
            handle.unlisten(*id);
        }
    })
}

fn spawn_commands(handle: AppHandle, source_project: String) {
    let ant_path = PathBuf::from(ANT_RESOURCE_PATH).join(ANT_COMMAND);
    let seven_zip_path = PathBuf::from(SEVEN_ZIP_RESOURCE_PATH);
    let is_killed = Arc::new(Mutex::new(false));
    let is_killed_clone = Arc::clone(&is_killed);
    let is_killed_clone2 = Arc::clone(&is_killed);
    remove_listeners(&handle);

    thread::spawn(move || {
        match resolve_resource_path(&handle, &ant_path) {
            Some(path) => {
                let child = spawn_ant_build(&path, &source_project);
                let pid = child.id();

                let id = handle.listen("cancel-sent", move |_e| {
                    let is_killed_clone = Arc::clone(&is_killed);
                    let mut is_killed_lock = is_killed_clone.lock().unwrap();
                    *is_killed_lock = kill_process(&pid);
                });

                get_global(&IDS_LISTENERS, |m| m.push(id));

                let formatted_output = format_output(child.wait_with_output().unwrap());
                let is_killed_lock = is_killed_clone.lock().unwrap();

                if *is_killed_lock {
                    let _ = handle.emit("cancel-received", "payload");
                    return;
                }

                if !is_build_successful(&formatted_output) {
                    let _ = handle.emit(ANT_EVENT_COMPLETE_WITH_ERROR, formatted_output);
                    return;
                }

                let _ = handle.emit(ANT_EVENT_COMPLETE_SUCCESSFUL, formatted_output);
            }
            None => {
                let _ = handle.emit(EVENT_RESOURCE_ERROR, "Falha ao encontrar o binario do Ant!");
                return;
            }
        }

        match resolve_resource_path(&handle, &seven_zip_path) {
            Some(path) => {
                let child = spawn_7zip(&path, &source_project);
                let pid = child.id();

                let id = handle.listen("cancel-sent", move |_e| {
                    let is_killed_clone = Arc::clone(&is_killed_clone2);
                    let mut is_killed_lock = is_killed_clone.lock().unwrap();
                    *is_killed_lock = kill_process(&pid);
                });

                get_global(&IDS_LISTENERS, |m| m.push(id));

                let formatted_output = format_output(child.wait_with_output().unwrap());

                let is_killed_lock = is_killed_clone.lock().unwrap();
                if *is_killed_lock {
                    let _ = handle.emit("cancel-received", "payload");
                    return;
                }

                if !is_7zip_successful(&formatted_output) {
                    let _ = handle.emit(_7ZIP_EVENT_COMPLETE_WITH_ERROR, formatted_output);
                    return;
                }

                let _ = handle.emit(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, formatted_output);
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

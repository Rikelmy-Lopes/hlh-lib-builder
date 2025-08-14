use std::os::windows::process::CommandExt;
use std::sync::mpsc;
use std::thread;
use std::{path::PathBuf, process::Command};
use tauri::path::BaseDirectory;
use tauri::Manager;

fn resolve_resource_path(handle: tauri::AppHandle, path: String) -> PathBuf {
    handle
        .path()
        .resolve(path, BaseDirectory::Resource)
        .unwrap()
}

fn execute_build(project_path: String, ant_path: String) -> String {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let output = Command::new(&ant_path.to_string())
            .args(["-q", "-f", &project_path, "clean", "jar"])
            /*             .args(["-version"]) */
            .creation_flags(0x08000000)
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
    let name = if cfg!(windows) { "ant.bat" } else { "ant" };
    let project_path = origem + "\\build.xml";
    let ant_path =
        resolve_resource_path(handle, format!("{}{}", "./resources/apache-ant/bin/", name));

    println!("Project path: {}", project_path);
    println!("Apache Ant path: {}", ant_path.display());

    execute_build(project_path, ant_path.to_str().unwrap().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![execute])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

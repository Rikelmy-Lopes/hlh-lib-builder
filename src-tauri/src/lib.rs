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

#[tauri::command]
fn execute(handle: tauri::AppHandle, origem: String) -> String {
    let build_xml = origem + "\\build.xml";
    println!("{}", build_xml);
    let name = if cfg!(windows) { "ant.bat" } else { "ant" };
    let ant_path =
        resolve_resource_path(handle, format!("{}{}", "./resources/apache-ant/bin/", name));

    println!("Ant path: {}", ant_path.display());

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let output = Command::new(&ant_path.to_str().unwrap())
            .args(["-q", "-f", &build_xml, "clean", "jar"])
            /*             .args(["-version"]) */
            .creation_flags(0x08000000)
            .output()
            .expect("Failed to execute Ant");

        let mut msg = format!("Ant path used: {}\n", ant_path.to_str().unwrap());
        msg.push_str(&String::from_utf8_lossy(&output.stdout));
        msg.push_str(&String::from_utf8_lossy(&output.stderr));

        tx.send(msg).unwrap();
    });
    rx.recv().unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![execute])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

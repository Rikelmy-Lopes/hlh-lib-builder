use tauri::{path::BaseDirectory, AppHandle, Manager};

pub fn resolve_resource_path(handle: &AppHandle, path: &str) -> Option<String> {
    match handle.path().resolve(path, BaseDirectory::Resource) {
        Ok(path) => Some(path.display().to_string()),
        Err(e) => {
            eprintln!("Falha ao resolver caminho do recurso: {}\n{}", path, e);
            None
        }
    }
}

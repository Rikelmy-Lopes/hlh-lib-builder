use log::error;
use std::path::PathBuf;
use tauri::{path::BaseDirectory, AppHandle, Manager};

pub fn resolve_resource_path(handle: &AppHandle, path: &PathBuf) -> Option<String> {
    match handle.path().resolve(path, BaseDirectory::Resource) {
        Ok(path) => Some(path.display().to_string()),
        Err(e) => {
            let error_message = format!(
                "Falha ao resolver caminho do recurso: {}\n{}",
                path.display().to_string(),
                e
            );
            error!("{}", error_message);
            None
        }
    }
}

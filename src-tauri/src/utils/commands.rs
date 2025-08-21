use crate::config::global::CREATE_NO_WINDOW_FLAG;
use std::{
    os::windows::process::CommandExt,
    process::{Command, Output},
};

pub fn spawn_ant_build(_project_path: &str, ant_path: &str) -> Output {
    Command::new(ant_path)
        .args(["-q", "-f", &_project_path, "clean", "jar"])
        /* .args(["-version"]) */
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .env_remove("ANT_HOME")
        .output()
        .expect("Falha ao executar o Apache Ant. Verifique se o caminho está correto.")
}

pub fn spawn_7zip(seven_zip_path: &str, origem: &str) -> Output {
    let path = format!("{}\\{}", origem, "\\dist\\SIGP_INT.jar");
    Command::new(seven_zip_path)
        .args(["d", &path, "META-INF\\persistence.xml"])
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        /* .args(["-version"]) */
        .output()
        .expect("Falha ao executar o 7zip.")
}

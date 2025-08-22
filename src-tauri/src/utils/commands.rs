use crate::config::constants::{BUILD_EXTENSION, CREATE_NO_WINDOW_FLAG};
use std::{
    os::windows::process::CommandExt,
    path::PathBuf,
    process::{Command, Output},
};

pub fn spawn_ant_build(ant_path: &str, origem: &str) -> Output {
    let project_path = PathBuf::from(origem).join(BUILD_EXTENSION);

    Command::new(ant_path)
        .arg("-q")
        .arg("-f")
        .arg(project_path)
        .arg("clean")
        .arg("jar")
        /* .arg("-version") */
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .env_remove("ANT_HOME")
        .output()
        .expect("Falha ao executar o Apache Ant. Verifique se o caminho está correto.")
}

pub fn spawn_7zip(seven_zip_path: &str, origem: &str) -> Output {
    let build_file_path = PathBuf::from(origem).join("dist/SIGP_INT.jar");

    Command::new(seven_zip_path)
        .arg("d")
        .arg(build_file_path)
        .arg("META-INF/persistence.xml")
        /* .arg("-version") */
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .output()
        .expect("Falha ao executar o 7zip.")
}

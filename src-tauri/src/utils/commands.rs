use crate::{
    config::constants::{BUILD_EXTENSION, CREATE_NO_WINDOW_FLAG},
    utils::output::format_output,
};
use std::{
    os::windows::process::CommandExt,
    path::PathBuf,
    process::{Child, Command, Stdio},
};

pub fn spawn_ant_build(ant_path: &str, source_project: &str) -> Child {
    let source_project_path = PathBuf::from(source_project).join(BUILD_EXTENSION);

    Command::new(ant_path)
        .arg("-q")
        .arg("-f")
        .arg(source_project_path)
        .arg("clean")
        .arg("jar")
        /* .arg("-version") */
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .env_remove("ANT_HOME")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Falha ao executar o Apache Ant. Verifique se o caminho está correto.")
}

pub fn spawn_7zip(seven_zip_path: &str, source_project: &str) -> Child {
    let build_file_path = PathBuf::from(source_project).join("dist/SIGP_INT.jar");

    Command::new(seven_zip_path)
        .arg("d")
        .arg(build_file_path)
        .arg("META-INF/persistence.xml")
        /* .arg("-version") */
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Falha ao executar o 7zip.")
}

pub fn kill_process(pid: &u32) -> bool {
    let result = Command::new("taskkill")
        .args(["/f", "/pid", &pid.to_string(), "/t"])
        .creation_flags(CREATE_NO_WINDOW_FLAG)
        .output();

    match result {
        Ok(output) => {
            if output.status.success() {
                println!("Success killing process with pid: {}", pid);
                true
            } else {
                println!("Failed killing process with pid: {}", pid);
                println!("{}", format_output(output));
                false
            }
        }
        Err(e) => {
            println!("Error killing process with pid: {}", pid);
            println!("{}", e);
            false
        }
    }
}

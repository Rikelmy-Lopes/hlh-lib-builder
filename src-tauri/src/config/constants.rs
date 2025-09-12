use std::sync::Mutex;

pub const ANT_EVENT_COMPLETE_SUCCESSFUL: &str = "ant-complete-successful";
pub const ANT_EVENT_COMPLETE_WITH_ERROR: &str = "ant-complete-with-error";
pub const _7ZIP_EVENT_COMPLETE_SUCCESSFUL: &str = "7zip-complete-successful";
pub const _7ZIP_EVENT_COMPLETE_WITH_ERROR: &str = "7zip-complete-with-error";
pub const EVENT_RESOURCE_ERROR: &str = "resource_error";
pub const ANT_RESOURCE_PATH: &str = "resources/apache-ant/bin/";
pub const SEVEN_ZIP_RESOURCE_PATH: &str = "resources/7zip/7z.exe";
pub const ANT_COMMAND: &str = if cfg!(windows) { "ant.bat" } else { "ant" };
pub const BUILD_EXTENSION: &str = "build.xml";
pub const CREATE_NO_WINDOW_FLAG: u32 = 0x08000000;
pub static IDS_LISTENERS: Mutex<Vec<u32>> = Mutex::new(Vec::new());

// function for handling global variables
pub fn get_global<T, F, R>(mutex: &Mutex<T>, f: F) -> R
where
    F: FnOnce(&mut T) -> R,
{
    let mut data = mutex.lock().unwrap();
    f(&mut data)
}

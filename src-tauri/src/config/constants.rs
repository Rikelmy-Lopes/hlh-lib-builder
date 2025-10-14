pub const ANT_EVENT_COMPLETE_SUCCESSFUL: &str = "ANT_COMPLETE_SUCCESSFUL";
pub const ANT_EVENT_COMPLETE_WITH_ERROR: &str = "ANT_COMPLETE_WITH_ERROR";
pub const _7ZIP_EVENT_COMPLETE_SUCCESSFUL: &str = "7ZIP_COMPLETE_SUCCESSFUL";
pub const _7ZIP_EVENT_COMPLETE_WITH_ERROR: &str = "7ZIP_COMPLETE_WITH_ERROR";
pub const EVENT_RESOURCE_ERROR: &str = "RESOURCE_ERROR";
pub const EVENT_CANCEL_SENT: &str = "CANCEL_SENT";
pub const EVENT_CANCEL_RECEIVED: &str = "CANCEL_RECEIVED";

pub const ANT_RESOURCE_PATH: &str = "resources/apache-ant/bin/";
pub const SEVEN_ZIP_RESOURCE_PATH: &str = "resources/7zip/7z.exe";
pub const ANT_COMMAND: &str = if cfg!(windows) { "ant.bat" } else { "ant" };
pub const BUILD_EXTENSION: &str = "build.xml";

pub const CREATE_NO_WINDOW_FLAG: u32 = 0x08000000;

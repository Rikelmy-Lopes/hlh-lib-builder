pub const ANT_RESOURCE_PATH: &str = "./resources/apache-ant/bin/";

pub const ANT_COMMAND: &str = if cfg!(windows) { "ant.bat" } else { "ant" };

pub const BUILD_EXTENSION: &str = "build.xml";

pub const CREATE_NO_WINDOW_FLAG: u32 = 0x08000000;

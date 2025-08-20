pub static ANT_RESOURCE_PATH: &str = "./resources/apache-ant/bin/";

pub static ANT_COMMAND: &str = if cfg!(windows) { "ant.bat" } else { "ant" };

pub static BUILD_EXTENSION: &str = "build.xml";

pub static CREATE_NO_WINDOW_FLAG: u32 = 0x08000000;

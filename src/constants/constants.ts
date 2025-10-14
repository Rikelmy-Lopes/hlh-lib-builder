export const ANT_EVENT_COMPLETE_SUCCESSFUL = "ANT_COMPLETE_SUCCESSFUL";
export const ANT_EVENT_COMPLETE_WITH_ERROR = "ANT_COMPLETE_WITH_ERROR";
export const _7ZIP_EVENT_COMPLETE_SUCCESSFUL = "7ZIP_COMPLETE_SUCCESSFUL";
export const _7ZIP_EVENT_COMPLETE_WITH_ERROR = "7ZIP_COMPLETE_WITH_ERROR";
export const EVENT_RESOURCE_ERROR = "RESOURCE_ERROR";
export const EVENT_CANCEL_SENT = "CANCEL_SENT";
export const EVENT_CANCEL_RECEIVED = "CANCEL_RECEIVED";
export const EVENT_REUSE_FILE = "EVENT_REUSE_FILE";

export const DESTINATION_LIB_PATH = "/src/main/webapp/WEB-INF/lib";
export const CONFIG_FILE = "config/settings.json";
export const BUILD_EXTENSION = "build.xml";
export const JAR_FILE_NAME = "SIGP_INT.jar";

export const ERROR_MESSAGES = Object.freeze({
  BUILD_XML_NOT_FOUND:
    "Arquivo build.xml não encontrado na origem! Verifique o caminho do projeto!",
  DESTINATION_NOT_FOUND: "Caminho de destino não encontrado! Verifique o caminho do projeto!",
  PATHS_EMPTY: "Caminhos de origem e destino devem ser preenchidos",
});

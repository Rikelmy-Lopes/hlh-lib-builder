import { listen } from "@tauri-apps/api/event";
import { writeLog } from "../utils/log";
import {
  _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
  _7ZIP_EVENT_COMPLETE_WITH_ERROR,
  ANT_EVENT_COMPLETE_SUCCESSFUL,
  ANT_EVENT_COMPLETE_WITH_ERROR,
} from "../constants/constants";

export function setListeners(
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
  setLog: React.Dispatch<React.SetStateAction<string>>
) {
  listen<string>(ANT_EVENT_COMPLETE_SUCCESSFUL, ({ payload }) => {
    console.log(ANT_EVENT_COMPLETE_SUCCESSFUL);
    writeLog(ANT_EVENT_COMPLETE_SUCCESSFUL + " ->> " + payload);
    setLog(payload);
  });

  listen<string>(ANT_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(ANT_EVENT_COMPLETE_WITH_ERROR);
    writeLog(ANT_EVENT_COMPLETE_WITH_ERROR + " ->> " + payload);
    setIsRunning(false);
    setLog(payload);
  });

  listen<string>(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, ({ payload }) => {
    console.log(_7ZIP_EVENT_COMPLETE_SUCCESSFUL);
    writeLog(_7ZIP_EVENT_COMPLETE_SUCCESSFUL + " ->> " + payload);
    setLog(payload);
  });

  listen<string>(_7ZIP_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(_7ZIP_EVENT_COMPLETE_WITH_ERROR);
    writeLog(_7ZIP_EVENT_COMPLETE_WITH_ERROR + " ->> " + payload);
    setLog(payload);
    setIsRunning(false);
  });

  listen<string>("log", ({ payload }) => {
    writeLog("[ERROR]" + " ->> " + payload);
  });
}

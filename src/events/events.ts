import { listen } from "@tauri-apps/api/event";
import { writeLog } from "../utils/log";
import {
  _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
  _7ZIP_EVENT_COMPLETE_WITH_ERROR,
  ANT_EVENT_COMPLETE_SUCCESSFUL,
  ANT_EVENT_COMPLETE_WITH_ERROR,
} from "../constants/constants";
import { displayErrorDialog, displaySuccessfulDialog } from "../dialog/prompt";
import { copyBuildFileToDestination } from "../utils/fsUtils";
let isListenersRegistered = false;

function setAntListeners(setIsRunning: React.Dispatch<React.SetStateAction<boolean>>) {
  listen<string>(ANT_EVENT_COMPLETE_SUCCESSFUL, ({ payload }) => {
    console.log(ANT_EVENT_COMPLETE_SUCCESSFUL);
    writeLog(ANT_EVENT_COMPLETE_SUCCESSFUL + " ->> " + payload);
  });

  listen<string>(ANT_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(ANT_EVENT_COMPLETE_WITH_ERROR);
    writeLog(ANT_EVENT_COMPLETE_WITH_ERROR + " ->> " + payload);
    setIsRunning(false);
    displayErrorDialog(payload);
  });
}

function set7zipListeners(
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
  origem: string,
  destino: string
) {
  listen<string>(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, async ({ payload }) => {
    console.log(_7ZIP_EVENT_COMPLETE_SUCCESSFUL);
    writeLog(_7ZIP_EVENT_COMPLETE_SUCCESSFUL + " ->> " + payload);
    const success = await copyBuildFileToDestination(origem, destino);
    success ? displaySuccessfulDialog() : displayErrorDialog("");
    setIsRunning(false);
  });

  listen<string>(_7ZIP_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(_7ZIP_EVENT_COMPLETE_WITH_ERROR);
    writeLog(_7ZIP_EVENT_COMPLETE_WITH_ERROR + " ->> " + payload);
    setIsRunning(false);
    displayErrorDialog(payload);
  });
}

export function setListeners(
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
  origem: string,
  destino: string
) {
  if (isListenersRegistered) return;

  setAntListeners(setIsRunning);
  set7zipListeners(setIsRunning, origem, destino);

  listen<string>("log", ({ payload }) => {
    writeLog("[ERROR]" + " ->> " + payload);
  });

  isListenersRegistered = true;
}

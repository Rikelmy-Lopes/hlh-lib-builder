import { listen } from "@tauri-apps/api/event";
import {
  _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
  _7ZIP_EVENT_COMPLETE_WITH_ERROR,
  ANT_EVENT_COMPLETE_SUCCESSFUL,
  ANT_EVENT_COMPLETE_WITH_ERROR,
  EVENT_RESOURCE_ERROR,
} from "../constants/constants";
import { displayErrorDialog, displaySuccessfulDialog } from "../dialog/prompt";
import { copyBuildFileToDestination } from "../utils/fsUtils";
import { error, info } from "@tauri-apps/plugin-log";
let isListenersRegistered = false;

function setAntListeners(setIsRunning: React.Dispatch<React.SetStateAction<boolean>>) {
  listen<string>(ANT_EVENT_COMPLETE_SUCCESSFUL, ({ payload }) => {
    info(`${ANT_EVENT_COMPLETE_SUCCESSFUL} --> ${payload}`);
  });

  listen<string>(ANT_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    error(`${ANT_EVENT_COMPLETE_WITH_ERROR} --> ${payload}`);
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
    info(`${_7ZIP_EVENT_COMPLETE_SUCCESSFUL} --> ${payload}`);
    const success = await copyBuildFileToDestination(origem, destino);
    success ? displaySuccessfulDialog() : displayErrorDialog("Erro ao copiar arquivo de build!");
    setIsRunning(false);
  });

  listen<string>(_7ZIP_EVENT_COMPLETE_WITH_ERROR, ({ payload }) => {
    error(`${_7ZIP_EVENT_COMPLETE_WITH_ERROR} --> ${payload}`);
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

  listen<string>(EVENT_RESOURCE_ERROR, ({ payload }) => {
    setIsRunning(false);
    displayErrorDialog(payload);
  });

  isListenersRegistered = true;
}

import { listen } from "@tauri-apps/api/event";

const ANT_COMPLETE_SUCCESSFUL = "ant-complete-successful";
const ANT_COMPLETE_WITH_ERROR = "ant-complete-with-error";
const _7ZIP_COMPLETE_SUCCESSFUL = "7zip-complete-successful";
const _7ZIP_COMPLETE_WITH_ERROR = "7zip-complete-with-error";

export function setListeners(
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
  setLog: React.Dispatch<React.SetStateAction<string>>
) {
  listen(ANT_COMPLETE_SUCCESSFUL, ({ payload }) => {
    console.log(ANT_COMPLETE_SUCCESSFUL);
    setLog(payload as string);
  });

  listen(ANT_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(ANT_COMPLETE_WITH_ERROR);
    setIsRunning(false);
    setLog(payload as string);
  });

  listen(_7ZIP_COMPLETE_SUCCESSFUL, ({ payload }) => {
    console.log(_7ZIP_COMPLETE_SUCCESSFUL);
    setLog(payload as string);
    setIsRunning(false);
  });

  listen(_7ZIP_COMPLETE_WITH_ERROR, ({ payload }) => {
    console.log(_7ZIP_COMPLETE_WITH_ERROR);
    setLog(payload as string);
    setIsRunning(false);
  });
}

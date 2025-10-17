import "./App.css";
import "./css/loading-animation.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { setListeners } from "./events/events";
import { loadConfig, saveConfig } from "./utils/config";
import { _7ZIP_EVENT_COMPLETE_SUCCESSFUL, EVENT_CANCEL_SENT, EVENT_REUSE_FILE } from "./constants/constants";
import { chooseFolder, shouldStart, shouldStop, shouldUseRecentFile, showErrorDialog } from "./dialog/prompt";
import { error } from "@tauri-apps/plugin-log";
import { emit } from "@tauri-apps/api/event";
import { isBuildFileRecent } from "./utils/fsUtils";
import { validatePaths } from "./utils/pathValidator";
import { blockDevTools } from "./utils/blockDevTools";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [sourceProject, setSourceProject] = useState("");
  const [targetProject, setTargetProject] = useState("");
  blockDevTools();

  async function start() {
    if (isRunning) return;
    try {
      const validationError = await validatePaths(sourceProject, targetProject);

      if (validationError) {
        setMessage(validationError);
        return;
      }

      await saveConfig(sourceProject, targetProject);
      if (!(await shouldStart())) {
        return;
      }

      setListeners(setIsRunning, sourceProject, targetProject);

      if (await isBuildFileRecent(sourceProject)) {
        if (await shouldUseRecentFile()) {
          await emit(EVENT_REUSE_FILE, { sourceProject, targetProject });
          return;
        }
      }

      setIsRunning(true);
      await invoke("start", { sourceProject });
    } catch (e) {
      setIsRunning(false);
      showErrorDialog((e as Error).message);
      error(`Error executing the program: ${(e as Error).message}`);
    }
  }

  async function stop() {
    if (!(await shouldStop())) {
      return;
    }
    await emit(EVENT_CANCEL_SENT);
  }

  useEffect(() => {
    if (message.length === 0) return;

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }, [message]);

  useEffect(() => {
    (async () => {
      const { sourceProject, targetProject } = await loadConfig();

      setSourceProject(sourceProject);
      setTargetProject(targetProject);
    })();
  }, []);

  return (
    <main className="container">
      <div className="container-input">
        <input
          type="text"
          value={sourceProject}
          placeholder="Origem (SIGP_INT)"
          onChange={({ target }) => setSourceProject(target.value.trim())}
          disabled={isRunning}
        />
        <button disabled={isRunning} onClick={() => chooseFolder(setSourceProject)}>
          Escolher
        </button>
      </div>
      <div className="container-input">
        <input
          type="text"
          value={targetProject}
          placeholder="Destino (sigpintegrado)"
          onChange={({ target }) => setTargetProject(target.value.trim())}
          disabled={isRunning}
        />
        <button disabled={isRunning} onClick={() => chooseFolder(setTargetProject)}>
          Escolher
        </button>
      </div>
      <div className="container-button">
        <button disabled={isRunning} onClick={start}>
          Executar
        </button>
        <button disabled={!isRunning} onClick={stop}>
          Cancelar
        </button>
        <div>
          {message} {isRunning ? "Processo inicializado, aguarde!" : ""}
        </div>
        <div className={isRunning ? "loader" : ""}></div>
      </div>
    </main>
  );
}

export default App;

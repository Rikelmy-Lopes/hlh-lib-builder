import "./App.css";
import "./css/loading-animation.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { copyBuildFileToDestination } from "./utils/fsUtils";
import { setListeners } from "./events/events";
import { loadConfig, saveConfig } from "./utils/config";
import { listen } from "@tauri-apps/api/event";
import {
  _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
  DESTINATION_LIB_PATH,
  ERROR_MESSAGES,
} from "./constants/constants";
import { join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import {
  chooseFolder,
  displayErrorDialog,
  displaySuccessfulDialog,
  shouldStart,
} from "./dialog/prompt";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  if (import.meta.env.PROD) {
    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  async function start() {
    if (isRunning) return;
    if (origem.length === 0 || destino.length === 0) {
      setLog(ERROR_MESSAGES.PATHS_EMPTY);
      return;
    }
    const buildXmlPath = await join(origem, "build.xml");
    const destinationLibPath = await join(destino, DESTINATION_LIB_PATH);

    if (!(await exists(buildXmlPath))) {
      setLog(ERROR_MESSAGES.BUILD_XML_NOT_FOUND);
      return;
    }
    if (!(await exists(destinationLibPath))) {
      setLog(ERROR_MESSAGES.DESTINATION_NOT_FOUND);
      return;
    }
    saveConfig(origem, destino);
    if (!(await shouldStart())) {
      return;
    }
    setIsRunning(true);
    setListeners(setIsRunning);
    invoke("start", { origem });
    listen(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, async () => {
      const success = await copyBuildFileToDestination(origem, destino);
      if (success) {
        displaySuccessfulDialog();
      } else {
        displayErrorDialog("");
      }
      setIsRunning(false);
    });
  }

  useEffect(() => {
    if (log.length === 0) return;

    setTimeout(() => {
      setLog("");
    }, 3000);
  }, [log]);

  useEffect(() => {
    (async () => {
      const { origem, destino } = await loadConfig();

      setOrigem(origem);
      setDestino(destino);
    })();
  }, []);

  return (
    <main className="container">
      <div className="container-input">
        <input
          type="text"
          value={origem}
          placeholder="Origem"
          onChange={({ target }) => setOrigem(target.value.trim())}
          disabled={isRunning}
        />
        <button disabled={isRunning} onClick={() => chooseFolder(setOrigem)}>
          Escolher
        </button>
      </div>
      <div className="container-input">
        <input
          type="text"
          value={destino}
          placeholder="Destino"
          onChange={({ target }) => setDestino(target.value.trim())}
          disabled={isRunning}
        />
        <button disabled={isRunning} onClick={() => chooseFolder(setDestino)}>
          Escolher
        </button>
      </div>
      <div className="container-button">
        <button disabled={isRunning} onClick={start}>
          Executar
        </button>
        <div>
          {log} {isRunning ? "Processo inicializado, aguarde!" : ""}
        </div>
        <div className={isRunning ? "loader" : ""}></div>
      </div>
    </main>
  );
}

export default App;

import "./App.css";
import "./css/loading-animation.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { setListeners } from "./events/events";
import { loadConfig, saveConfig } from "./utils/config";
import {
  _7ZIP_EVENT_COMPLETE_SUCCESSFUL,
  DESTINATION_LIB_PATH,
  ERROR_MESSAGES,
} from "./constants/constants";
import { join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { chooseFolder, shouldStart } from "./dialog/prompt";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  if (import.meta.env.PROD) {
    const blockedKeys = ["f3", "f5", "f7", "f12"];
    const blockedCtrl = ["r", "j", "u", "p", "f", "g", "s", "h"];
    const blockedCtrlShift = ["i", "j", "c", "e", "k", "delete"];

    window.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
      },
      true
    );

    const keyHandler = function (event: globalThis.KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (
        blockedKeys.includes(key) ||
        (event.ctrlKey && blockedCtrl.includes(key)) ||
        (event.ctrlKey && event.shiftKey && blockedCtrlShift.includes(key)) ||
        (event.metaKey && ["r", "s"].includes(key)) // Added save for macOS
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false; // Extra prevention
      }
    };

    document.addEventListener("keydown", keyHandler, true);
    window.addEventListener("keydown", keyHandler, true);
  }

  async function validatePaths(): Promise<string | null> {
    if (!origem || !destino) {
      return ERROR_MESSAGES.PATHS_EMPTY;
    }

    const buildXmlPath = await join(origem, "build.xml");
    const destinationLibPath = await join(destino, DESTINATION_LIB_PATH);

    if (!(await exists(buildXmlPath))) {
      return ERROR_MESSAGES.BUILD_XML_NOT_FOUND;
    }

    if (!(await exists(destinationLibPath))) {
      return ERROR_MESSAGES.DESTINATION_NOT_FOUND;
    }

    return null;
  }

  async function start() {
    if (isRunning) return;

    const validationError = await validatePaths();

    if (validationError) {
      setLog(validationError);
      return;
    }

    saveConfig(origem, destino);
    if (!(await shouldStart())) {
      return;
    }
    setIsRunning(true);
    setListeners(setIsRunning, origem, destino);
    invoke("start", { origem });
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

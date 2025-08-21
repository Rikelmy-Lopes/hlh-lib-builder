import "./App.css";
import "./css/loading-animation.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { copyBuildFileToDestination, pathExists } from "./utils/fsUtils";
import { setListeners } from "./events/events";
import { loadConfig, saveConfig } from "./utils/config";
import { listen } from "@tauri-apps/api/event";
import { _7ZIP_EVENT_COMPLETE_SUCCESSFUL, DESTINATION_LIB_PATH } from "./constants/constants";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  async function start() {
    if (isRunning) return;
    if (origem.length === 0 || destino.length === 0) return;

    if (!(await pathExists(origem + "\\build.xml"))) {
      setLog("Arquivo build.xml não encontrado na origem! Verifique o caminho do projeto!");
      return;
    }
    if (!(await pathExists(destino + DESTINATION_LIB_PATH))) {
      setLog("Caminho de destino não encontrado! Verifique o caminho do projeto!");
      return;
    }
    saveConfig(origem, destino);
    setIsRunning(true);
    setListeners(setIsRunning, setLog);
    invoke("start", { origem });
    listen(_7ZIP_EVENT_COMPLETE_SUCCESSFUL, async () => {
      await copyBuildFileToDestination(origem, destino);
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
      <input
        type="text"
        name=""
        id=""
        value={origem}
        placeholder="Origem"
        onChange={({ target }) => setOrigem(target.value.trim())}
        disabled={isRunning}
      />
      <input
        type="text"
        name=""
        id=""
        value={destino}
        placeholder="Destino"
        onChange={({ target }) => setDestino(target.value.trim())}
        disabled={isRunning}
      />
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

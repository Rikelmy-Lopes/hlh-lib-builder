import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import "./css/loading-animation.css";
import { useEffect, useState } from "react";
import { pathExists } from "./utils/fsUtils";
import { setListeners } from "./events/events";
import { loadConfig, saveConfig } from "./utils/config";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  /*   function testeOnly() {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 5000);
  } */

  async function execute() {
    if (isRunning) return;
    /* testeOnly(); */
    if (origem.length === 0 || destino.length === 0) return;

    if (!(await pathExists(origem + "\\build.xml"))) {
      setLog(
        "Arquivo build.xml não encontrado na origem! Verifique o caminho do projeto!"
      );
      return;
    }
    if (!(await pathExists(destino + "\\src\\main\\webapp\\WEB-INF\\lib"))) {
      setLog(
        "Caminho de destino não encontrado! Verifique o caminho do projeto!"
      );
      return;
    }
    saveConfig(origem, destino);
    setIsRunning(true);
    setListeners(setIsRunning, setLog);
    invoke("run_command", { origem });
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
        <button disabled={isRunning} onClick={execute}>
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

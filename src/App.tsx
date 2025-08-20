import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import "./css/loading-animation.css";
import { useEffect, useState } from "react";
import { pathExists } from "./utils/fsUtils";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [_destino, setDestino] = useState("");

  /*   function testeOnly() {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 5000);
  } */

  async function execute() {
    /* testeOnly(); */
    if (origem.length === 0) return;
    if (isRunning) return;

    if (!(await pathExists(origem))) {
      setLog("Caminho de origem não encontrado");
      return;
    }
    setIsRunning(true);
    invoke("run_command", { origem });

    listen("command-complete", ({ payload }) => {
      setLog(payload as string);
      setIsRunning(false);
    });
  }

  useEffect(() => {
    if (log.length !== 0) {
      setTimeout(() => {
        setLog("");
      }, 3000);
    }
  }, [log]);

  return (
    <main className="container">
      <input
        type="text"
        name=""
        id=""
        placeholder="Origem"
        onChange={({ target }) => setOrigem(target.value)}
        disabled={isRunning}
      />
      <input
        type="text"
        name=""
        id=""
        placeholder="Destino"
        onChange={({ target }) => setDestino(target.value)}
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

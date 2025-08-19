import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useEffect, useState } from "react";
import { pathExists } from "./utils/fsUtils";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [_destino, setDestino] = useState("");
  

  async function execute() {
    if (origem.length === 0) return;
    if (isRunning) return;

    if (!(await pathExists(origem))) {
        setLog('Caminho de origem não encontrado');
        return;
    }
    setIsRunning(true)
    invoke<string>("execute", { origem });

    listen("command-complete", ({ payload }) => {
      setLog(payload as string);
      setIsRunning(false);
    })
  }

  useEffect(() => {
    if (log.length !== 0) {
      setTimeout(() => {
        setLog("")
      }, 3000)
    }
  }, [log])

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
      <button
        disabled={isRunning}
        onClick={execute}>
        Executar
      </button>
      <div>
    {
      log
    }
      </div>
    </main>
  );
}

export default App;

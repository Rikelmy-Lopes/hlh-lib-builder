import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [log, setLog] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  async function execute() {
    if (origem.length === 0) return;

    const log = await invoke<string>("execute", { origem });
    setLog(log);
  }

  useEffect(() => {
    if (log.length !== 0) {
      setTimeout(() => {
        setLog("")
      }, 60000)
    }
  }, [log])

  return (
    <main className="container">
      <input type="text" name="" id="" placeholder="Origem" onChange={({ target }) => setOrigem(target.value)} />
      <input type="text" name="" id="" placeholder="Destino" onChange={({ target }) => setDestino(target.value)} />
      <button onClick={execute}>
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

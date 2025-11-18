import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

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
import { Alert, Button, createTheme, CssBaseline, Stack, TextField, ThemeProvider } from "@mui/material";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [sourceProject, setSourceProject] = useState("");
  const [targetProject, setTargetProject] = useState("");
  blockDevTools();

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1976d2",
      },
      background: {
        default: " #252525ff",
      },
    },
  });

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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <main className="container">
        <Stack direction="row" gap={1} margin={1} height={50}>
          <TextField
            id="outlined-basic"
            value={sourceProject}
            disabled={isRunning}
            onChange={({ target }) => setSourceProject(target.value.trim())}
            fullWidth={true}
            required={true}
            label="Origem (SIGP_INT)"
            variant="outlined"
          />
          <Button disabled={isRunning} onClick={() => chooseFolder(setSourceProject)} variant="contained">
            Escolher
          </Button>
        </Stack>
        <Stack direction="row" gap={1} margin={1} height={50}>
          <TextField
            value={targetProject}
            onChange={({ target }) => setTargetProject(target.value.trim())}
            disabled={isRunning}
            required={true}
            fullWidth={true}
            label="Destino (sigpintegrado)"
            variant="outlined"
          />
          <Button disabled={isRunning} onClick={() => chooseFolder(setTargetProject)} variant="contained">
            Escolher
          </Button>
        </Stack>
        <Stack spacing={2} gap={1} margin={1} alignItems={"center"}>
          <Button disabled={isRunning} onClick={start} variant="contained">
            Executar
          </Button>
          <Button disabled={!isRunning} onClick={stop} variant="contained">
            Cancelar
          </Button>
          {isRunning && (
            <Alert variant="filled" severity="info">
              Processo inicializado, aguarde!
            </Alert>
          )}
          {message && (
            <Alert variant="filled" severity="warning">
              {message} {isRunning ? "Processo inicializado, aguarde!" : ""}
            </Alert>
          )}
          <div className={isRunning ? "loader" : ""}></div>
        </Stack>
      </main>
    </ThemeProvider>
  );
}

export default App;

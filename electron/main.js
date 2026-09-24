const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

const isDev = !app.isPackaged;

let mainWindow;
let backendProcess;

function startBackend() {
  const backendEntry = path.join(__dirname, "../backend/server.js");

  backendProcess = fork(backendEntry, [], {
    stdio: "inherit",
    env: { ...process.env },
  });

  backendProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Backend process exited with code ${code}`);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Vite dev server (npm run dev --prefix frontend)
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Зібраний фронт (npm run build --prefix frontend)
    mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});

const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "CashGuard",
    icon: path.join(__dirname, 'public/favicon.ico'), // Asegúrate de tener un icono si lo deseas
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Permitir acceso simple a recursos locales si es necesario
    },
    autoHideMenuBar: true, // Ocultar la barra de menú por defecto
  });

  if (isDev) {
    // En desarrollo, carga la URL de Vite
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // En producción, carga el archivo index.html compilado
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
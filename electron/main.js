const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Development: load từ Vite server (JSX hoạt động ở đây)
    if (!app.isPackaged) {
        win.loadURL('http://localhost:3000');
        // win.webContents.openDevTools();
    } else {
        // Production: load file đã build
        win.loadFile(path.join(__dirname, './index.html'));
    }

    win.maximize();
}

app.whenReady().then(createWindow);
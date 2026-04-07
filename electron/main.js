// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// function createWindow() {
//     const win = new BrowserWindow({
//         fullscreen: true,
//         webPreferences: {
//             nodeIntegration: false,
//             contextIsolation: true
//         }
//     });

//     // Development: load từ Vite server (JSX hoạt động ở đây)
//     if (!app.isPackaged) {
//         win.loadURL('http://localhost:3000');
//         // win.webContents.openDevTools();
//     } else {
//         // Production: load file đã build
//         win.loadFile(path.join(__dirname, './index.html'));
//     }

//     // win.maximize();
// }

// app.whenReady().then(createWindow);

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {

    // Window 1
    const win1 = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Window 2
    const win2 = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    if (!app.isPackaged) {
        win1.loadURL('http://localhost:3000');
        win2.loadURL('http://localhost:3000/e-center-board/eboard_1');
    } else {
        win1.loadFile(path.join(__dirname, './index.html'));
        win2.loadFile(path.join(__dirname, './index.html'));
    }
}

app.whenReady().then(createWindow);
// Modules to control application life and create native browser window
import path = require('path');
import { app, BrowserWindow } from 'electron';
import isDev = require('electron-is-dev');

import './background';

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            devTools: isDev,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const startURL = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../client/build/index.html')}`;

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    mainWindow.loadURL(startURL);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('ping', 'whoooooooh!');
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

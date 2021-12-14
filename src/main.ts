// Modules to control application life and create native browser window
import path = require("path");
import { exec } from "child_process";
import { app, BrowserWindow } from "electron";
import { client as WebSocketClient } from "websocket";

socketToLoL();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function socketToLoL() {
  var client = new WebSocketClient({
    tlsOptions: { rejectUnauthorized: false },
  });

  client.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
  });

  client.on("connect", function (connection) {
    connection.on("error", function (error) {
      console.log("Connection Error: " + error.toString());
    });

    connection.on("close", function () {
      client.abort();
    });

    connection.on("message", function (message) {
      if (message.type === "utf8") {
        if (message.utf8Data.includes("/lol-lobby-team-builder/champ-select/v1/session")) {
          const dataFormatted: IChampSelectSessionEvent = JSON.parse(message.utf8Data);
          console.log(dataFormatted);
        }
      }
    });

    function subscribe() {
      if (connection.connected) {
        connection.sendUTF('[5,"OnJsonApiEvent"]');
      }
    }
 
    subscribe();
  });

  exec(
    "wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline",
    (err, stdout) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      const pass = RegExp('"--remoting-auth-token=(.+?)"').exec(stdout)[1];
      const port = RegExp('"--app-port=(\\d+?)"').exec(stdout)[1];

      client.connect(`wss://127.0.0.1:${port}/`, "wamp", undefined, {
        authorization:
          "Basic " + Buffer.from(`riot:${pass}`).toString("base64"),
      });
    }
  );
}

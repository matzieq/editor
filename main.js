const { BrowserWindow, app, dialog } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const fs = require("fs");
require("electron-reloader")(module);

/** @type BrowserWindow */
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
    },
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("index.html");
};

app.whenReady().then(createWindow);

ipcMain.on("new-doc-triggered", () => {
  console.log("WERKT");
  dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "text file", extensions: ["txt"] }],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, "", err => {
        if (err) {
          console.error(err);
        } else {
          mainWindow.webContents.send("document-created", filePath);
        }
      });
    });
});

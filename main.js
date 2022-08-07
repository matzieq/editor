const {
  BrowserWindow,
  app,
  dialog,
  Notification,
  MenuItem,
  Menu,
} = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const fs = require("fs");
require("electron-reloader")(module);

const isMac = process.platform === "darwin";

/** @type BrowserWindow */
let mainWindow;

let openFilePath = "";

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "editor",
  });

  /** @type MenuItem[] */
  const menuTemplate = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New",
          click: () => ipcMain.emit("new-doc-triggered"),
        },
        {
          label: "Open",
          click: () => ipcMain.emit("open-doc-triggered"),
        },
        { role: "separator" },
        {
          label: "Open Recent",
          role: "recentdocuments",
          submenu: [
            {
              label: "Clear Recent",
              role: "clearrecentdocuments",
            },
          ],
        },
        {
          role: "quit",
        },
      ],
    },
    { role: "editMenu" },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("index.html");
};

function handleError() {
  new Notification({
    title: "Error",
    body: "Sorry, something went wrong",
  }).show();
}

app.whenReady().then(createWindow);

ipcMain.on("new-doc-triggered", () => {
  dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "text file", extensions: ["txt"] }],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, "", err => {
        if (err) {
          handleError();
        } else {
          app.addRecentDocument(filePath);
          openFilePath = filePath;
          mainWindow.webContents.send("document-created", filePath);
        }
      });
    });
});

ipcMain.on("open-doc-triggered", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "text file", extensions: ["txt"] }],
    })
    .then(({ filePaths }) => {
      const filePath = filePaths[0];

      fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
          handleError();
        } else {
          app.addRecentDocument(filePath);
          openFilePath = filePath;
          mainWindow.webContents.send("document-opened", { filePath, data });
        }
      });
    });
});

ipcMain.on("file-content-updated", (_, content) => {
  fs.writeFile(openFilePath, content, err => {
    if (err) {
      handleError();
    }
  });
});

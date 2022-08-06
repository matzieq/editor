const { ipcRenderer } = require("electron/renderer");

window.addEventListener("DOMContentLoaded", () => {
  const newBtn = document.getElementById("new-btn");
  const openBtn = document.getElementById("open-btn");

  newBtn.addEventListener("click", () => {
    ipcRenderer.send("new-doc-triggered");
  });

  ipcRenderer.on("document-created", (_, filePath) => {
    console.log(filePath);
  });
});

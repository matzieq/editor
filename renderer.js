const { ipcRenderer } = require("electron/renderer");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
  const newBtn = document.getElementById("new-btn");
  const openBtn = document.getElementById("open-btn");
  const docName = document.getElementById("doc-name");
  const editedText = document.getElementById("edited-text");

  newBtn.addEventListener("click", () => {
    ipcRenderer.send("new-doc-triggered");
  });

  openBtn.addEventListener("click", () => {
    ipcRenderer.send("open-doc-triggered");
  });

  editedText.addEventListener("input", e => {
    ipcRenderer.send("file-content-updated", e.target.value);
  });

  /**
   *
   * @param {string} filePath
   * @param {string} documentContent
   * @returns {void}
   */
  function handleDocumentChange(filePath, documentContent = "") {
    docName.innerHTML = path.parse(filePath).base;
    editedText.removeAttribute("disabled");
    editedText.value = documentContent;
    editedText.focus();
  }

  ipcRenderer.on("document-created", (_, filePath) => {
    handleDocumentChange(filePath);
  });

  ipcRenderer.on("document-opened", (_, { filePath, data }) => {
    handleDocumentChange(filePath, data);
  });
});

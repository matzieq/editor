const { ipcRenderer } = require("electron/renderer");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
  const editedText = document.getElementById("edited-text");

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

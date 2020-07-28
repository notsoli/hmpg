// renders editable directory navigation
(() => {
  // waits until html data is loaded
  window.addEventListener('load', init)

  // init function
  async function init() {
    try {
      // dom objects
      const dom = {
        directoryInput: document.querySelector("#directoryLabel"),
        linkInput: document.querySelector("#linkInput"),
        directoryButton: document.querySelector("#directoryButton"),
        renameButton: document.querySelector("#renameButton"),
        moveButton: document.querySelector("#moveButton"),
        deleteButton: document.querySelector("#deleteButton"),
        previewTarget: document.querySelector("#previewWrapper"),
        fileTarget: document.querySelector("#fileWrapper")
      }

      const fileEdit = new Edit()
      await fileEdit.init(dom)
    } catch (error) {
      throw error
    }
  }
})()

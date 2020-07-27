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
        itemName: document.querySelector("#itemName"),
        itemSize: document.querySelector("#itemSize"),
        itemType: document.querySelector("#itemType"),
        linkLabel: document.querySelector("#linkLabel"),
        linkValue: document.querySelector("#linkValue"),
        previewImage: document.querySelector("#previewImage"),
        target: document.querySelector("#fileWrapper")
      }

      await edit.init(dom)
    } catch (error) {
      throw error
    }
  }
})()

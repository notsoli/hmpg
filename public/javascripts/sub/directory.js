// renders static directory navigation
(() => {
  // waits until html data is loaded
  window.addEventListener('load', init)

  // init function
  async function init() {
    try {
      let targetid, targetPath
      const cookies = document.cookie.split("; ")
      for (let i = 0; i < cookies.length; i++) {
        const currentCookie = cookies[i].split("=")
        if (currentCookie[0] === "targetid") {
          targetid = currentCookie[1]
        } else if (currentCookie[0] === "targetPath") {
          targetPath = JSON.parse(decodeURIComponent(currentCookie[1]))
        }
      }

      // dom objects
      const dom = {
        previewTarget: document.querySelector("#previewWrapper"),
        fileTarget: document.querySelector("#fileWrapper")
      }

      // check if both components were found
      if (targetid && targetPath) {
        await explore.init(dom, targetid, targetPath)
      }
    } catch (error) {
      throw error
    }
  }
})()

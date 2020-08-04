// renders static directory navigation
(() => {
  // waits until html data is loaded
  window.addEventListener('load', init)

  // dom elements
  let main

  // init function
  async function init() {
    try {
      // check if both components were found
      if (targetid && targetPath) {
        info = await fs.sendPartialRequest(targetid, [targetPath])

        const username = window.location.hostname.split(".")[0]

        main = document.querySelector('#main')

        // iterate through each returned directory
        for (let i = 0; i < info.length; i++) {
          if (info[i].display === "default") {
            // setup explore
            const directoryExplore = new Explore({target: main}, username)
            await directoryExplore.init(info[i])
          } else if (info[i].display === "gallery") {
            // setup explore
            const directoryGallery = new Gallery({target: main}, username)
            await directoryGallery.init(info[i])
          }
        }
      }
    } catch (error) {
      throw error
    }
  }
})()

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

        main = document.querySelector('#main')

        // iterate through each returned directory
        for (let i = 0; i < info.length; i++) {
          // dom object
          const dom = {}
          if (info[i].display === "default") {
            // setup explore
            const directoryExplore = new Explore()
            await directoryExplore.init(main, info[i])
          } else if (info[i].display === "gallery") {
            // gallery wrapper
            dom.galleryTarget = main

            // setup explore
            const directoryGallery = new Gallery()
            await directoryGallery.init(dom, info[i])
          }
        }
      }
    } catch (error) {
      throw error
    }
  }
})()

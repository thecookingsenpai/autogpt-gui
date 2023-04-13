// Modules to control application life and create native browser window
const {app, BrowserWindow, screen} = require('electron')
const path = require('path')
var width;
var height;

function createWindow () {
  let sizes = screen.getPrimaryDisplay().workAreaSize
  width = sizes.width
  height = sizes.height
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'assets/icon.png'),
    width: width,
    height: height,
    webPreferences: {
      // Enabling nodejs
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and loading the index.html of the app.
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', function () {
  app.quit()
})
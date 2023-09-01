import icon from '../../resources/icon.png?asset'
import { Logger } from './logger'
import { WSClient } from './wsClient'
import { WINDOW_RESOLUTION } from '@bot_cast/shared'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, app, globalShortcut, shell } from 'electron'
import { join } from 'path'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: is.dev ? WINDOW_RESOLUTION.WIDTH_DEV : WINDOW_RESOLUTION.WIDTH,
    height: is.dev ? WINDOW_RESOLUTION.HEIGHT_DEV : WINDOW_RESOLUTION.HEIGHT,
    show: false,
    autoHideMenuBar: true,
    //...(process.platform === 'linux' ? { icon } : {}),
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.prod.html'))
  }

  if (is.dev) {
    globalShortcut.register('f5', function () {
      mainWindow.reload()
    })

    mainWindow.webContents.openDevTools()
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createWindow()
  const client = new WSClient(win)

  let castDisconnected = false

  app.on('before-quit', async (e) => {
    if (!castDisconnected) {
      e.preventDefault()
      await client.disconnect()
      castDisconnected = true
      Logger.info('async operation done, quitting')
      app.quit()
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

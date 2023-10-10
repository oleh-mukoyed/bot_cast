import { Logger } from './logger'
import { EVENTS } from '@bot_cast/shared'
import { BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

export class Update {
  constructor(private win: BrowserWindow) {
    autoUpdater.logger = Logger
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: 'bot_cast',
      owner: 'oleh-mukoyed'
    })
  }

  checkForUpdates() {
    autoUpdater.checkForUpdates()

    autoUpdater.on('checking-for-update', () => {
      this.win.webContents.send(EVENTS.UPDATE_CHECKING, true)
    })

    autoUpdater.on('update-available', () => {
      this.win.webContents.send(EVENTS.UPDATE_AVAILABLE, true)
    })

    autoUpdater.on('update-not-available', () => {
      this.win.webContents.send(EVENTS.UPDATE_NOT_AVAILABLE, true)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      const downloadProgress = Math.floor(progressObj.percent)

      this.win.webContents.send(EVENTS.UPDATE_PROGRESS, downloadProgress)
    })

    autoUpdater.on('update-downloaded', () => {
      this.win.webContents.send(EVENTS.UPDATE_DOWNLOADED, true)
      autoUpdater.quitAndInstall()
    })

    autoUpdater.on('error', (error) => {
      this.win.webContents.send(EVENTS.UPDATE_ERROR, error)
    })
  }
}

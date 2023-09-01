import { getTimeStr } from '../helpers/dateTime'
import { BrowserWindow } from 'electron'

export class DesktopMessage {
  public static send(msg: string, isError = false): void {
    msg = '\\ ' + getTimeStr() + ` .... ${msg}<br>`
    if (isError) msg = `<span class="error">${msg}</span>`

    const window = BrowserWindow.getAllWindows()[0]
    if (window) window.webContents.send('update-console', msg)
  }
}

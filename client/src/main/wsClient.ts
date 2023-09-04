import { Logger } from './logger'
import { DesktopCaster } from './services/desktopCaster'
import { HostFile } from './services/hostFile'
import { appStore } from './settings'
import { BotStage } from './telegram_bot/botStage'
import { ALLOWED_FILE_TYPES_MIME, EVENTS, STORE_KEYS } from '@bot_cast/shared'
import { BrowserWindow, ipcMain } from 'electron'
import { nanoid } from 'nanoid'
import { Socket, io } from 'socket.io-client'

export class WSClient {
  private socket!: Socket

  constructor(
    private win: BrowserWindow,
    private readonly botStage = new BotStage(),
    private readonly desktopCast = DesktopCaster.getInstance()
  ) {
    this.socketEvents()
    this.rendererEvents()
    this.mainEvents()
  }

  async socketEvents(): Promise<void> {
    const id = WSClient.getId()

    const initStage = await this.botStage.processStageByBotMessage('')
    const initButtons = await initStage.getButtons()
    const telegram_id = appStore.get(STORE_KEYS.TELEGRAM_ID, false)

    const socket = io(`${import.meta.env.MAIN_VITE_SERVER_URL}`, {
      transports: ['websocket'],
      auth: {
        client_id: id,
        telegram_id: telegram_id,
        buttons: initButtons,
        text: initStage.getText()
      }
    })

    this.socket = socket

    socket.on(EVENTS.SOCKET_ON_CONNECT, () => {
      this.connected()
    })

    socket.on(EVENTS.COMMAND, async (data, response) => {
      const stage = await this.botStage.processStageByBotMessage(data)
      const buttons = await stage.getButtons()

      response({
        buttons: buttons,
        text: this.botStage.getStage().getText(),
        photo: this.botStage.getStage().getPhoto()
      })
    })

    socket.on(EVENTS.TELEGRAM_ID, async (telegramId, response) => {
      appStore.set(STORE_KEYS.TELEGRAM_ID, telegramId)

      this.linkedWithTelegram()

      response({
        buttons: initButtons,
        text: initStage.getText(),
        photo: initStage.getPhoto()
      })
    })

    socket.on(EVENTS.SOCKET_ON_CONNECT_ERROR, () => {
      Logger.debug(`${EVENTS.SOCKET_ON_CONNECT_ERROR}`)
      this.disconnected()

      setTimeout(() => {
        socket.connect()
      }, 5000)
    })

    socket.on(EVENTS.SOCKET_ON_DISCONNECT, () => {
      this.disconnected()
    })
  }

  rendererEvents(): void {
    ipcMain.on(EVENTS.CONNECT_TO_DEVICE, (_, name) => {
      this.desktopCast.connectToDeviceByName(name)
    })

    ipcMain.on(EVENTS.DISCONNECT_FROM_DEVICE, () => {
      this.desktopCast.disconnect()
    })

    ipcMain.handle(EVENTS.GET_DEVICES, async () => {
      const cast = this.desktopCast.getCastInstance()
      await cast.refreshDevices()
      const result = cast.getDevicesNames()
      return result
    })

    ipcMain.on(EVENTS.CAST_LOCAL_FILE, async (_, fileName) => {
      const host = HostFile.getInstance()
      const hostedFile = (await host.hostFile(fileName, ALLOWED_FILE_TYPES_MIME)) as string

      if (!hostedFile) return

      this.desktopCast.cast(hostedFile)
    })

    ipcMain.on(EVENTS.PLAY_LOCAL_FILE, () => {
      this.desktopCast.play()
    })

    ipcMain.on(EVENTS.PAUSE_LOCAL_FILE, () => {
      this.desktopCast.pause()
    })

    ipcMain.on(EVENTS.STOP_CAST_LOCAL_FILE, () => {
      this.desktopCast.stopCast()
    })

    ipcMain.on(EVENTS.ELECTRON_STORE_GET, (event, data) => {
      event.returnValue = appStore.get(data.key, data.def)
    })

    ipcMain.on(EVENTS.ELECTRON_STORE_SET, (_, key, val) => {
      appStore.set(key, val)
    })
  }

  mainEvents(): void {
    this.desktopCast.on(EVENTS.DEVICE_CONNECTED, () => {
      this.botStage.afterConnectFromLocalPlayer()
      this.sendToBot()
    })

    this.desktopCast.on(EVENTS.DEVICE_DISCONNECTED, () => {
      this.botStage.afterDisconnectFromLocalPlayer()
      this.sendToBot()
    })

    this.desktopCast.on(EVENTS.CAST_STARTED, (url) => {
      this.botStage.afterCastFromLocalPlayer(url)

      this.sendToBot()
    })
  }

  async sendToBot(): Promise<void> {
    const stage = this.botStage.getStage()
    const buttons = await stage.getButtons()
    const data = {
      buttons: buttons,
      text: this.botStage.getStage().getText(),
      photo: this.botStage.getStage().getPhoto()
    }

    this.socket.emit(EVENTS.STAGE, data)
  }

  connected(): void {
    appStore.set(STORE_KEYS.SERVER_CONNECTED, true)

    this.win.webContents.send(EVENTS.SERVER_CONNECTED, { data: true })
  }

  disconnected(): void {
    appStore.set(STORE_KEYS.SERVER_CONNECTED, false)

    this.win.webContents.send(EVENTS.SERVER_CONNECTED, { data: false })
  }

  linkedWithTelegram(): void {
    appStore.set(STORE_KEYS.LINK_WITH_TELEGRAM, true)

    this.win.webContents.send(EVENTS.LINK_WITH_TELEGRAM, { data: true })
  }

  static getId(): string {
    let id = appStore.get(STORE_KEYS.ID) as string
    if (id) return id

    id = nanoid()
    appStore.set(STORE_KEYS.ID, id)

    return id
  }

  async disconnect(): Promise<boolean> {
    const res = await this.desktopCast.disconnect()
    return res
  }
}

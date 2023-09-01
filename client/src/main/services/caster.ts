import { Logger } from '../logger'
import { AssociativeArray } from '../types'
import { Chromecast } from './chromecast'
import { BrowserWindow } from 'electron'
import EventEmitter from 'events'

export abstract class Caster extends EventEmitter {
  constructor(protected chromecast = Chromecast.getInstance()) {
    super()
  }

  abstract sendConnectionErrorEvent(deviceName: string): void
  abstract sendConnectedEvent(deviceName: string): void
  abstract sendDisconnectedEvent(): void
  abstract sendDisconnectErrorEvent(): void
  abstract sendCastStartedEvent(url: string): void
  abstract sendCastStartErrorEvent(url: string): void
  abstract sendCastStoppedEvent(): void
  abstract sendCastStopErrorEvent(): void
  abstract sendSubtitleRemovedEvent(): void
  abstract sendSubtitleShowedEvent(): void
  abstract sendSubtitleChangeFontScaleEvent(): void

  getCastInstance(): Chromecast {
    return this.chromecast
  }

  async connectToDeviceByName(deviceName: string): Promise<boolean> {
    const connect = await this.chromecast.connectToDeviceByName(deviceName)

    connect ? this.sendConnectedEvent(deviceName) : this.sendConnectionErrorEvent(deviceName)

    return connect
  }

  async disconnect(): Promise<boolean> {
    const disconnect = await this.chromecast.disconnect()

    disconnect ? this.sendDisconnectedEvent() : this.sendDisconnectErrorEvent()

    return disconnect
  }

  async cast(
    url: string,
    subtitles?: AssociativeArray<string> | undefined,
    active = -1
  ): Promise<boolean> {
    const cast = await this.chromecast.cast(url, subtitles, active)

    cast ? this.sendCastStartedEvent(url) : this.sendCastStartErrorEvent(url)

    return cast
  }

  async stopCast(): Promise<boolean> {
    const stop = await this.chromecast.stopCast()

    stop ? this.sendCastStoppedEvent() : this.sendCastStopErrorEvent()

    return stop
  }

  async play(): Promise<boolean> {
    return await this.chromecast.play()
  }

  async pause(): Promise<boolean> {
    return await this.chromecast.pause()
  }

  async removeSubtitles(): Promise<boolean> {
    const remove = await this.chromecast.removeSubtitles()

    if (remove) this.sendSubtitleRemovedEvent()

    return remove
  }

  async showSubtitle(index: number): Promise<boolean> {
    const show = await this.chromecast.showSubtitle(index)

    if (show) this.sendSubtitleShowedEvent()

    return show
  }

  async subtitleChangeFontScale(fontScale: number): Promise<boolean> {
    const change = await this.chromecast.subtitleChangeFontScale(fontScale)

    if (change) this.sendSubtitleChangeFontScaleEvent()

    return change
  }

  sendToRenderer(name: string, data?: any): void {
    try {
      const window = BrowserWindow.getAllWindows()[0]

      window?.webContents.send(name, data)
    } catch (error) {
      Logger.error('sendToRenderer error :', error)
    }
  }

  sendToMain(name: string, data?: any): void {
    try {
      this.emit(name, data)
    } catch (error) {
      Logger.error('sendToMain error :', error)
    }
  }

  sendToRendererAndMain(name: string, data?: any): void {
    this.sendToRenderer(name, data)
    this.sendToMain(name, data)
  }
}

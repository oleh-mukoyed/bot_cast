import { Caster } from './caster'
import { EVENTS } from '@bot_cast/shared'

export class DesktopCaster extends Caster {
  private static instance: DesktopCaster

  static getInstance(): DesktopCaster {
    if (!this.instance) this.instance = new DesktopCaster()

    return this.instance
  }

  private constructor() {
    super()
    this.chromecast.setMediaEventsCallBack('RENDERER', this.sendToRenderer)
  }

  sendConnectedEvent(deviceName: string): void {
    this.sendToRendererAndMain(EVENTS.DEVICE_CONNECTED, deviceName)
  }

  sendConnectionErrorEvent(deviceName: string): void {
    this.sendToRendererAndMain(EVENTS.DEVICE_CONNECTION_ERROR, deviceName)
  }

  sendDisconnectedEvent(): void {
    this.sendToRendererAndMain(EVENTS.DEVICE_DISCONNECTED)
  }

  sendDisconnectErrorEvent(): void {
    this.sendToRendererAndMain(EVENTS.DEVICE_DISCONNECTED_ERROR)
  }

  sendCastStartedEvent(url: string): void {
    this.sendToRendererAndMain(EVENTS.CAST_STARTED, url)
  }

  sendCastStartErrorEvent(url: string): void {
    this.sendToRendererAndMain(EVENTS.CAST_START_ERROR, url)
  }

  sendSubtitleRemovedEvent(): void {
    this.sendToRenderer(EVENTS.SUBTITLES_REMOVED)
  }

  sendSubtitleShowedEvent(): void {
    this.sendToRenderer(EVENTS.SUBTITLES_SHOWED)
  }

  sendSubtitleChangeFontScaleEvent(): void {
    this.sendToRenderer(EVENTS.SUBTITLE_CHANGE_FONT_SCALE)
  }

  sendCastStoppedEvent(): void {
    this.sendToRenderer(EVENTS.CAST_STOPPED)
  }

  sendCastStopErrorEvent(): void {
    this.sendToRenderer(EVENTS.CAST_STOP_ERROR)
  }
}

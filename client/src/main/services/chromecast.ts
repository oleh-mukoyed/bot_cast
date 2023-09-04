import connectImg from '../../../resources/connect.jpg?asset'
import { constants } from '../config/constants'
import { Logger } from '../logger'
import { AssociativeArray, CastDevice, CastDevices } from '../types'
import { HostFile } from './hostFile'
import { EVENTS, MediaEventsCallBack } from '@bot_cast/shared'
import { CONNECTION_NS, ChromecastDevice, MEDIA_NS } from 'stratocaster'

export class Chromecast {
  private static instance: Chromecast

  private deviceName = ''
  private devices: CastDevices = {}

  readonly DEFAULT_MEDIA_RECEIVER_APP_ID = constants.BOT.DEFAULT_MEDIA_RECEIVER_APP_ID

  readonly SUBTITLES_STYLE = constants.CAST.SUBTITLES_STYLE

  private device: ChromecastDevice | undefined = undefined
  private mediaSessionId: number | undefined = undefined
  private mediaEventsCallBack: Map<MediaEventsCallBack, { (name: string, data?: any): void }> =
    new Map()

  protected constructor() {}

  static getInstance(): Chromecast {
    if (!this.instance) this.instance = new Chromecast()

    return this.instance
  }

  async refreshDevices(): Promise<void> {
    this.devices = await this.getDevices()
  }

  getDevice(): ChromecastDevice | undefined {
    const deviceName = this.getDeviceName()
    return deviceName && !this.device ? new ChromecastDevice(deviceName) : this.device
  }

  async isAppAvailable(): Promise<boolean> {
    const device = this.getDevice()

    if (!device) return false

    const status = await device.getStatus()

    if (!status || !Array.isArray(status.applications)) return false

    const app = status.applications.find((a) => a.appId === this.DEFAULT_MEDIA_RECEIVER_APP_ID)

    if (!app) return false

    return true
  }

  async checkAppWithThrow(): Promise<void> {
    if (!(await this.isAppAvailable())) {
      throw new Error('App is not running')
    }
  }

  async sendByMediaChanel(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const app = await this.device!.app(this.DEFAULT_MEDIA_RECEIVER_APP_ID)
      const mediaChannel = await app.channel(MEDIA_NS)

      return await mediaChannel.send(data)
    } catch (error) {
      Logger.error('sendByMediaChanel error:', {
        data: error
      })
      throw error
    }
  }

  async sendSimpleByMediaChanel(type: string): Promise<boolean> {
    try {
      await this.checkAppWithThrow()

      await this.sendByMediaChanel({
        mediaSessionId: this.getMediaSessionId(),
        type: type
      })

      return true
    } catch (error) {
      Logger.error('sendSimpleByMediaChanel error:', {
        data: error
      })
    }
    return false
  }

  setMediaEventsCallBack(
    key: MediaEventsCallBack,
    callback: (name: string, data?: any) => void
  ): void {
    this.mediaEventsCallBack.set(key, callback)
  }

  events(): void {
    this.mediaEvents()
  }

  async mediaEvents(): Promise<void> {
    try {
      if (!this.mediaEventsCallBack.size) return
      const app = await this.device!.app(this.DEFAULT_MEDIA_RECEIVER_APP_ID)
      const mediaChannel = await app.channel(MEDIA_NS)

      for await (const msg of mediaChannel.receive()) {
        for (const [_, callback] of this.mediaEventsCallBack.entries()) {
          callback(EVENTS.MEDIA_STATE, msg)
        }
      }
    } catch (error) {
      Logger.error('mediaEvents error:', {
        data: error
      })
    }
  }

  async isMediaAvailable(): Promise<boolean> {
    try {
      await this.checkAppWithThrow()

      const mediaStatus = (await this.sendByMediaChanel({
        type: 'GET_STATUS'
      })) as any

      const connectScreen = mediaStatus?.status[0]?.media?.connectMedia

      return !connectScreen && !!mediaStatus?.status[0]?.playerState
    } catch (error) {
      Logger.error('error :', error)
    }

    return false
  }

  getMediaSessionId(): number | undefined {
    return this.mediaSessionId
  }

  setMediaSessionId(id: number | undefined): void {
    this.mediaSessionId = id
  }

  clearMediaSessionId(): void {
    this.setMediaSessionId(undefined)
  }

  async connectToDeviceByName(deviceName: string): Promise<boolean> {
    try {
      this.refreshDevices()
      if (this.getDevicesNames().indexOf(deviceName) === -1) {
        throw new Error(`Device ${deviceName} not found`)
      }

      this.setDeviceName(deviceName)

      this.device = new ChromecastDevice(deviceName)

      this.events()

      const host = HostFile.getInstance()
      const hostedFile = (await host.hostFile(connectImg)) as string

      const res = await this.sendByMediaChanel({
        type: 'LOAD',
        media: {
          contentId: hostedFile,
          streamType: 'BUFFERED',
          connectMedia: true
        }
      })

      this.setMediaSessionId((res as any)?.status[0]?.mediaSessionId)

      return true
    } catch (error) {
      Logger.error('connectToDeviceByName error:', {
        data: error
      })
    }

    return false
  }

  async disconnect(): Promise<boolean> {
    try {
      this.device = this.getDevice()

      if (!this.device) {
        throw new Error(`Device not found`)
      }

      const app = await this.device.app(this.DEFAULT_MEDIA_RECEIVER_APP_ID)
      const connectChannel = await app.channel(CONNECTION_NS)

      await connectChannel.write({ type: 'CLOSE' })

      if (this.device) {
        this.device.close()
        this.device = undefined
        this.clearMediaSessionId()
      }

      return true
    } catch (error) {
      Logger.error('disconnect error:', {
        data: error
      })
    }

    return false
  }

  async cast(
    url: string,
    subtitles?: AssociativeArray<string> | undefined,
    active = -1
  ): Promise<boolean> {
    try {
      await this.checkAppWithThrow()

      const data: any = {
        type: 'LOAD',
        media: {
          contentId: url,
          streamType: 'BUFFERED'
        }
      }

      if (subtitles && Object.keys(subtitles).length && data.media) {
        data.media['tracks'] = []
        let i = 0
        for (const sub in subtitles) {
          const subtitle = subtitles[sub]
          const track = {
            trackId: i++,
            type: 'TEXT',
            trackContentId: subtitle,
            trackContentType: 'text/vtt',
            name: sub,
            //language: 'en-US',
            subtype: 'SUBTITLES'
          }

          data.media['tracks'].push(track)
        }
        data.media['textTrackStyle'] = this.SUBTITLES_STYLE
      }

      if (active > -1) data.activeTrackIds = [active]

      const cast = await this.sendByMediaChanel(data as Record<string, unknown>)

      this.setMediaSessionId((cast as any)?.status[0]?.mediaSessionId)

      return true
    } catch (error) {
      Logger.error('cast error:', {
        data: error
      })
    }

    return false
  }

  async stopCast(): Promise<boolean> {
    const stop = await this.sendSimpleByMediaChanel('STOP')
    if (stop) this.clearMediaSessionId()

    return stop
  }

  async play(): Promise<boolean> {
    return await this.sendSimpleByMediaChanel('PLAY')
  }

  async pause(): Promise<boolean> {
    return await this.sendSimpleByMediaChanel('PAUSE')
  }

  async changeSubtitles(params: unknown): Promise<boolean> {
    try {
      await this.checkAppWithThrow()

      await this.sendByMediaChanel({
        type: 'EDIT_TRACKS_INFO',
        mediaSessionId: this.getMediaSessionId(),
        ...(params as Object)
      })

      return true
    } catch (error) {
      Logger.error('changeSubtitles error:', {
        data: error
      })
    }
    return false
  }

  async removeSubtitles(): Promise<boolean> {
    const removeSubtitles = await this.changeSubtitles({
      activeTrackIds: []
    })

    return removeSubtitles
  }

  async showSubtitle(index = 0): Promise<boolean> {
    const showSubtitle = await this.changeSubtitles({
      activeTrackIds: [index]
    })

    return showSubtitle
  }

  async subtitleChangeFontScale(fontScale: number): Promise<boolean> {
    const styles = this.SUBTITLES_STYLE
    styles['fontScale'] = fontScale
    const fontStyleChanged = await this.changeSubtitles({
      textTrackStyle: styles
    })

    return fontStyleChanged
  }

  async getDevices(): Promise<CastDevices> {
    const devices: CastDevices = {}

    for await (const device of ChromecastDevice.discover({
      searchTimeout: 500
    })) {
      const descriptor = await device.getServiceDescriptor()
      devices[device.name] = {
        name: device.name,
        address: descriptor.address,
        id: descriptor.id,
        port: descriptor.port
      }
    }
    return devices
  }

  getDevicesNames(): string[] {
    const names: string[] = []
    for (const deviceName in this.devices) {
      names.push(deviceName)
    }
    return names
  }

  getDeviceName(): string {
    return this.deviceName
  }

  setDeviceName(deviceName: string): void {
    this.deviceName = deviceName
  }

  getDeviceByName(deviceName: string): CastDevice | boolean {
    if (!deviceName) return false

    if (this.devices[deviceName]) return this.devices[deviceName]

    return false
  }

  checkDeviceByName(deviceName: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.devices, deviceName)
  }

  checkDevicesAvailable(): boolean {
    return !!Object.keys(this.devices).length
  }
}

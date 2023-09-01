import { Chromecast } from '../../services/chromecast'
import { Refresh } from './refresh'
import { Stage } from './stage'
import { Start } from './start'

export class CastDevices extends Stage {
  static readonly code = 'cast_devices'
  static readonly stageName = 'Cast Devices'

  constructor() {
    super()
    this.allowStages = [Refresh.code]
    this.prevStage = Start.code
    this.buttons = [Refresh.stageName]
    this.text = 'Choose device for cast. 📺'
  }

  getCode() {
    return CastDevices.code
  }
  getName() {
    return CastDevices.stageName
  }

  async getButtons(): Promise<string[]> {
    let buttons = await super.getButtons()

    const chromecast = Chromecast.getInstance()
    await chromecast.refreshDevices()
    const devices = chromecast.getDevicesNames()

    if (devices) buttons = [...devices, ...buttons]

    return buttons
  }
}

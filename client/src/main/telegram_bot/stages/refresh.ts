import { Chromecast } from '../../services/chromecast'
import { Stage } from './stage'
import { Start } from './start'

export class Refresh extends Stage {
  static readonly code = 'refresh'
  static readonly stageName = 'Refresh'

  constructor() {
    super()
    this.allowStages = [Refresh.code]
    this.prevStage = Start.code
    this.buttons = [Refresh.stageName]
    this.text = 'No device was found. please wait and refresh. 🧐'
  }

  getCode() {
    return Refresh.code
  }
  getName() {
    return Refresh.stageName
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

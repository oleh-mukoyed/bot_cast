import { Chromecast } from '../../services/chromecast'
import { CastDevices } from './castDevices'
import { Disconnect } from './disconnect'
import { SetUrl } from './setUrl'
import { Stage } from './stage'

export class Connected extends Stage {
  static readonly code = 'connected'
  static readonly stageName = 'Connected'

  constructor() {
    super()
    this.allowStages = [SetUrl.code, Disconnect.code]
    this.buttons = [SetUrl.stageName, Disconnect.stageName]
    this.backBtn = true
    this.prevStage = CastDevices.code

    const chromecast = Chromecast.getInstance()
    this.text = 'You successfully connected to device - ' + chromecast.getDeviceName() + '. 📶'
  }

  getCode() {
    return Connected.code
  }
  getName() {
    return Connected.stageName
  }
}

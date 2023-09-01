import { Chromecast } from '../../services/chromecast'
import { Stage } from './stage'

export class Disconnect extends Stage {
  static readonly code = 'disconnect'
  static readonly stageName = 'Disconnect'

  constructor() {
    super()
    this.backBtn = false

    const chromecast = Chromecast.getInstance()
    this.text = 'You successfully disconnected from device - ' + chromecast.getDeviceName() + '. 📤'
  }

  getCode() {
    return Disconnect.code
  }
  getName() {
    return Disconnect.stageName
  }
}

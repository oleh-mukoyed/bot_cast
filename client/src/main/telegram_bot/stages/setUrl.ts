import { Connected } from './connected'
import { Disconnect } from './disconnect'
import { Stage } from './stage'

export class SetUrl extends Stage {
  static readonly code = 'set_url'
  static readonly stageName = 'Set url'

  constructor() {
    super()
    this.allowStages = [Disconnect.code]
    this.buttons = [Disconnect.stageName]
    this.backBtn = true
    this.prevStage = Connected.code
    this.text =
      'Enter a link to a site with a series or movie. ' +
      'Link must be with https protocol. ' +
      'For now, just hdrezka supports. 🔗'
  }

  /* async getButtons(): Promise<string[]> {
    const buttons = await super.getButtons()
    const chromecast = Chromecast.getInstance()

    if (await chromecast.isMediaAvailable()) {
      buttons.push(Cast.name)
    }

    return buttons
  }

  async isAllowStage(code: string): Promise<boolean> {
    const chromecast = Chromecast.getInstance()

    if (await chromecast.isMediaAvailable()) {
      return code === Cast.code
    }

    return await super.isAllowStage(code)
  } */

  getCode() {
    return SetUrl.code
  }
  getName() {
    return SetUrl.stageName
  }
}

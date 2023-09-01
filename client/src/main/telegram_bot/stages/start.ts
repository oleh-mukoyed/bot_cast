import { CastDevices } from './castDevices'
import { ControlPc } from './controlPc'
import { Stage } from './stage'

export class Start extends Stage {
  static readonly code = 'start'
  static readonly stageName = 'Start'

  constructor() {
    super()
    this.allowStages = [CastDevices.code, ControlPc.code]
    this.buttons = [CastDevices.stageName, ControlPc.stageName]
    this.backBtn = false
    this.text = 'Welcome to BotCast. ✋🤚'
  }

  getCode() {
    return Start.code
  }
  getName() {
    return Start.stageName
  }
}

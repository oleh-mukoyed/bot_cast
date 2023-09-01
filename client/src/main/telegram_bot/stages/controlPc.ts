import { Shutdown } from './shutdown'
import { Stage } from './stage'
import { Start } from './start'

export class ControlPc extends Stage {
  static readonly code = 'control_pc'
  static readonly stageName = 'Control Pc'

  constructor() {
    super()
    this.allowStages = [Shutdown.code]
    this.prevStage = Start.code
    this.buttons = [Shutdown.stageName]
    this.text = 'You also can control your PC via this bot. ' + 'Please choose an option. 🎮'
  }

  getCode() {
    return ControlPc.code
  }
  getName() {
    return ControlPc.stageName
  }
}

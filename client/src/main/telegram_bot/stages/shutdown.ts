import { ControlPc } from './controlPc'
import { Stage } from './stage'

export class Shutdown extends Stage {
  static readonly code = 'shutdown'
  static readonly stageName = 'Shutdown'

  constructor() {
    super()
    this.prevStage = ControlPc.code
    this.text =
      'Choose an option for set a shutdown timer. ' +
      'Or you can text it(formats: <i>{n}m, {n}h, {n.n}h</i>). 🔻'
  }

  public getCode() {
    return Shutdown.code
  }
  public getName() {
    return Shutdown.stageName
  }
}

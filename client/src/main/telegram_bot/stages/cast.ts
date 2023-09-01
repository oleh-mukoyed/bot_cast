import { SetUrl } from './setUrl'
import { Stage } from './stage'

export class Cast extends Stage {
  static readonly code = 'cast'
  static readonly stageName = 'Cast'

  constructor() {
    super()
    this.prevStage = SetUrl.code
    this.text = 'Choose an option to control the casting process. 📽'
  }

  getCode() {
    return Cast.code
  }
  getName() {
    return Cast.stageName
  }
}

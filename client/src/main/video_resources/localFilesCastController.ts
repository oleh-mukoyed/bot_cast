import { StageController } from '../interfaces/stageController.interface'
import { BotCaster } from '../services/botCaster'

export class LocalFilesCastController implements StageController {
  protected caster: BotCaster

  protected text = ''
  protected info = ''
  protected sendPhoto = false

  protected CAST_STAGE_NAME = 'Cast'
  protected STOP_STAGE_NAME = 'Stop'
  protected PLAY_STAGE_NAME = 'Play'
  protected PAUSE_STAGE_NAME = 'Pause'

  readonly BUTTONS = [
    this.CAST_STAGE_NAME,
    this.PLAY_STAGE_NAME,
    this.PAUSE_STAGE_NAME,
    this.STOP_STAGE_NAME
  ]

  constructor(protected url: string) {
    this.url = url
    this.caster = BotCaster.getInstance()
  }

  async parseMessage(): Promise<boolean> {
    return true
  }

  async processControllerButtonAction(botMsg: string): Promise<boolean> {
    this.setText('')

    if (botMsg === this.CAST_STAGE_NAME) {
      const cast = await this.cast()
      if (cast) this.setText('Cast started')

      return cast
    }
    if (botMsg === this.STOP_STAGE_NAME) {
      const stop = await this.stop()
      if (stop) this.setText('Cast stopped.')

      return stop
    }
    if (botMsg === this.PLAY_STAGE_NAME) {
      const play = await this.play()
      if (play) this.setText('Cast resumed.')

      return play
    }
    if (botMsg === this.PAUSE_STAGE_NAME) {
      const pause = await this.pause()
      if (pause) this.setText('Cast paused.')

      return pause
    }

    return false
  }

  getControllerButtons(): string[] {
    return this.BUTTONS
  }

  getText(): string {
    return this.text
  }

  isBackButton(): boolean {
    return true
  }

  getPhoto(): string {
    return ''
  }

  setText(text: string): void {
    this.text = text
  }

  async cast(): Promise<boolean> {
    return await this.caster.cast(this.url)
  }

  async stop(): Promise<boolean> {
    return await this.caster.stopCast()
  }

  async play(): Promise<boolean> {
    return await this.caster.play()
  }

  async pause(): Promise<boolean> {
    return await this.caster.pause()
  }
}

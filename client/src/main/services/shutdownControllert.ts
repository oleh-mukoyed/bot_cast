import { StageController } from '../interfaces/stageController.interface'
import { Logger } from '../logger'
import { execSync } from 'child_process'

export class ShutdownController implements StageController {
  private buttons = ['Now', '5m', '10m', '30m', '1h', '1.5h', '2h', '3h', '6h', 'Aboard']

  private text = ''

  async processControllerButtonAction(botMsg: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (botMsg === 'Aboard') {
          this.aboard()
          this.setText('Shutdown canceled.')
          resolve(true)
          return
        }

        const seconds = this.getSecondsByMessage(botMsg)
        this.shutdown(seconds)
        this.setText('Your PC will turn off after ' + botMsg)
        resolve(true)
        return
      } catch (error: any) {
        this.setText(error.message)
        Logger.error(error.message, { data: error })
      }

      resolve(false)
    })
  }

  getSecondsByMessage(msg: string): number {
    if (msg === 'Now') {
      return 1
    }

    if (/^[1-9][0-9]*m$/.test(msg)) return parseFloat(msg) * 60
    if (/^[1-9][0-9]*h|[1-9][0-9]*\.5h$/.test(msg)) return parseFloat(msg) * 60 * 60

    throw new Error('Invalid message format.')
  }

  shutdown(seconds: number): void {
    execSync(`shutdown -s -t ${seconds}`)
  }

  aboard(): void {
    execSync(`shutdown -a`)
  }

  getControllerButtons(): string[] {
    return this.buttons
  }

  getText(): string {
    return this.text
  }

  getPhoto(): string {
    return ''
  }

  setText(text: string) {
    this.text = text
  }

  async parseMessage(): Promise<boolean> {
    return new Promise((resolve) => resolve(false))
  }

  isBackButton(): boolean {
    return true
  }
}

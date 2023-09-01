//import { Keyboard } from 'grammy';
//import { ReplyKeyboardRemove } from 'grammy/types';
import { constants } from '../../config/constants'
import { StageController } from '../../interfaces/stageController.interface'

export abstract class Stage {
  static readonly code: string
  static readonly stageName: string
  protected allowStages: string[] = []
  protected prevStage = ''
  protected buttons: string[] = []
  protected backBtn = true
  protected text = ''
  protected controller?: StageController
  private textPrefix = '📩 '

  abstract getCode(): string

  abstract getName(): string

  isAllowStage(code: string): boolean {
    return this.allowStages.includes(code)
  }

  /* async getKeyboard(): Promise<Keyboard | ReplyKeyboardRemove> {
    const buttons = await this.getButtons();

    if (buttons.length === 0) return { remove_keyboard: true };

    const keyboard: Keyboard = new Keyboard();

    buttons.forEach((button, index) => {
      keyboard.text(button);
      if ((index + 1) % 3 === 0) keyboard.row();
    });

    keyboard.resized();

    return keyboard;
  } */

  async getButtons(): Promise<string[]> {
    const buttons: string[] = []

    const controllerButton = this.controller?.getControllerButtons()
    if (controllerButton) buttons.push(...controllerButton)

    this.buttons.forEach((button) => {
      buttons.push(button)
    })

    if (this.isBackButton() && this.controller?.isBackButton() !== false)
      buttons.push(constants.BOT.BACK_BTN_NAME)

    return new Promise((resolve) => resolve(buttons))
  }

  getController(): StageController | undefined {
    return this.controller
  }

  setController(controller: StageController): void {
    this.controller = controller
  }

  getPrevStage(): string | undefined {
    return this.prevStage
  }

  isBackButton(): boolean {
    return this.backBtn
  }

  getText(): string {
    const controllerText = this.controller?.getText()
    const text = controllerText ? controllerText : this.text

    return text ? this.textPrefix + text : ''
  }

  getPhoto() {
    const controllerPhoto = this.controller?.getPhoto()

    return controllerPhoto ? controllerPhoto : ''
  }
}

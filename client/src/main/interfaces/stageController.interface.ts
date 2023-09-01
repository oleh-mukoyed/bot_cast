export interface StageController {
  getControllerButtons(): string[]
  processControllerButtonAction(botMsg: string): Promise<boolean>
  isBackButton(): boolean
  parseMessage(): Promise<boolean>
  getText(): string
  getPhoto(): string
}

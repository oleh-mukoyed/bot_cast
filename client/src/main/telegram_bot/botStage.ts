import { constants } from '../config/constants'
import { StageController } from '../interfaces/stageController.interface'
import { BotCaster } from '../services/botCaster'
import { CastManager } from '../services/castManager'
import { ShutdownController } from '../services/shutdownControllert'
import { LocalFilesCastController } from '../video_resources/localFilesCastController'
import { Cast } from './stages/cast'
import { CastDevices } from './stages/castDevices'
import { Connected } from './stages/connected'
import { ControlPc } from './stages/controlPc'
import { Disconnect } from './stages/disconnect'
import { Refresh } from './stages/refresh'
import { SetUrl } from './stages/setUrl'
import { Shutdown } from './stages/shutdown'
import { Stage } from './stages/stage'
import { Start } from './stages/start'
import { EVENTS } from '@bot_cast/shared'
import { BrowserWindow } from 'electron'

export class BotStage {
  private stage: Stage
  private stages: Map<string, unknown>
  private stagesNameCodeMap: Map<string, string>

  constructor(private botCaster = BotCaster.getInstance()) {
    this.stage = new Start()

    this.stages = new Map<string, unknown>()
    this.stages.set(Start.code, Start)
    this.stages.set(ControlPc.code, ControlPc)
    this.stages.set(Shutdown.code, Shutdown)
    this.stages.set(CastDevices.code, CastDevices)
    this.stages.set(Refresh.code, Refresh)
    this.stages.set(Connected.code, Connected)
    this.stages.set(Disconnect.code, Disconnect)
    this.stages.set(SetUrl.code, SetUrl)
    this.stages.set(Cast.code, Cast)

    this.stagesNameCodeMap = new Map<string, string>()
    this.stagesNameCodeMap.set(Start.stageName, Start.code)
    this.stagesNameCodeMap.set(ControlPc.stageName, ControlPc.code)
    this.stagesNameCodeMap.set(Shutdown.stageName, Shutdown.code)
    this.stagesNameCodeMap.set(CastDevices.stageName, CastDevices.code)
    this.stagesNameCodeMap.set(Refresh.stageName, Refresh.code)
    this.stagesNameCodeMap.set(Connected.stageName, Connected.code)
    this.stagesNameCodeMap.set(Disconnect.stageName, Disconnect.code)
    this.stagesNameCodeMap.set(SetUrl.stageName, SetUrl.code)
    this.stagesNameCodeMap.set(Cast.stageName, Cast.code)
  }

  getStage() {
    return this.stage
  }

  async processStageByBotMessage(botMsg: string): Promise<Stage> {
    botMsg = botMsg.trim()

    if (!botMsg) return this.stage

    const nextStageCode = await this.getNextStageCodeByMsg(botMsg)

    const nextStage = await this.getCheckedNextStage(botMsg, nextStageCode)

    this.stage = nextStage

    BrowserWindow.getAllWindows()[0]?.webContents.send(EVENTS.BOT_STAGE_CHANGED, {
      buttons: await nextStage.getButtons(),
      text: nextStage.getText(),
      photo: nextStage.getPhoto()
    })

    return nextStage
  }

  async getNextStageCodeByMsg(botMsg: string): Promise<string> {
    const code = this.stagesNameCodeMap.get(botMsg)

    if (!code || !this.stages.has(code)) return this.stage.getCode()

    if (this.stage.isAllowStage(code)) return code

    return this.stage.getCode()
  }

  async getCheckedNextStage(botMsg: string, nextStageCode: string): Promise<Stage> {
    if (
      botMsg === constants.BOT.BACK_BTN_NAME &&
      this.stage.isBackButton() &&
      this.stage.getPrevStage()
    ) {
      return this.createNewStageByCode(this.stage.getPrevStage() as string)
    }

    const stageController = this.stage.getController()
    if (stageController) {
      await stageController.processControllerButtonAction(botMsg)
      return this.stage
    }

    if (nextStageCode === Shutdown.code) {
      const shutdown = new Shutdown()
      const shutdownController = new ShutdownController()
      shutdown.setController(shutdownController)

      return shutdown
    }

    if (nextStageCode === SetUrl.code && botMsg !== SetUrl.stageName) {
      const castController = CastManager.getCastController(botMsg) as StageController

      if (castController && (await castController.parseMessage())) {
        const cast = new Cast()
        cast.setController(castController)
        return cast
      }

      return new SetUrl()
    }

    const chromecast = this.botCaster.getCastInstance()
    await chromecast.refreshDevices()

    if (nextStageCode === Disconnect.code && (await this.botCaster.disconnect())) {
      return new CastDevices()
    }

    if (
      nextStageCode === CastDevices.code &&
      botMsg === CastDevices.stageName &&
      !chromecast.checkDevicesAvailable()
    ) {
      return new Refresh()
    }

    if (nextStageCode === CastDevices.code && chromecast.checkDeviceByName(botMsg)) {
      const connect = await this.botCaster.connectToDeviceByName(botMsg)

      return connect ? new Connected() : new Refresh()
    }

    if (nextStageCode === Refresh.code && chromecast.checkDevicesAvailable()) {
      return new CastDevices()
    }

    return nextStageCode === this.stage.getCode()
      ? this.stage
      : this.createNewStageByCode(nextStageCode)
  }

  createNewStageByCode(code: string): Stage {
    const className = this.stages.get(code) as any
    return className ? new className() : this.stage
  }

  afterCastFromLocalPlayer(url: string) {
    const cast = new Cast()
    const controller = new LocalFilesCastController(url)
    cast.setController(controller as StageController)
    this.stage = cast
  }

  afterConnectFromLocalPlayer() {
    this.stage = new Connected()
  }

  afterDisconnectFromLocalPlayer() {
    this.stage = new CastDevices()
  }
}

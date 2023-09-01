import { StageController } from '../interfaces/stageController.interface'

export type AssociativeArray<T> = { [key: string]: T }

export type Stage = {
  code: string
  name: string
  controller?: StageController
}

export type StageMap = {
  [key: string]: {
    stage: Stage
    allowStages: Stage[]
    prevStage?: Stage
    buttons?: string[]
    backBtn?: boolean
    text?: string
  }
}

export type KeyboardSettings = {
  buttons: string[]
}

/* export type CastDevice = {
  addresses: string[]
  subtypes?: []
  rawTxt?: []
  txt?: object
  name?: string
  fqdn?: string
  host?: string
  referer?: object
  port?: number
  type?: string
  protocol?: string
} */

export type CastDevice = {
  name: string
  address: string
  id: string
  port: number
}

export type CastDevices = { [key: string]: CastDevice }

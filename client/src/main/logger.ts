import { is } from '@electron-toolkit/utils'
import Logger from 'electron-log'

if (is.dev) {
  Logger.transports.file.level = false
  Logger.transports.console.level = 'silly'
}

export { Logger }

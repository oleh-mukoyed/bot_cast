import { is } from '@electron-toolkit/utils'
import Logger from 'electron-log'
import path from 'path'

if (is.dev) {
  //Logger.transports.file.resolvePath = () => path.join(__dirname, '../../logs/main.log')
  Logger.transports.file.level = false
  Logger.transports.console.level = 'silly'
}

export { Logger }

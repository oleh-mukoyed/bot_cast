import { is } from '@electron-toolkit/utils'
import Store from 'electron-store'

const name = is.dev ? 'config_dev' : 'config'
export const appStore = new Store({ name: name })

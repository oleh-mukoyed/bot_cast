import { EVENTS, MediaState, STORE_KEYS } from '@bot_cast/shared'
import { useMessage } from '@renderer/hooks/useMessage'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const { ipcRenderer } = window.electron

interface ConnectContextType {
  serverConnected: boolean
  telegramLinked: boolean
  castTV: string
  isProcess: string
  id: string
  mediaState: MediaState
  castFileName: string
  setCastFileName: (url: string) => void
  getDevices: () => Promise<Array<string>>
  connectToDevice: (name: string) => void
  disconnectFromDevice: () => void
}

const linkedWithTelegram = window.api.store.get(STORE_KEYS.LINK_WITH_TELEGRAM, false) as boolean
const connected = window.api.store.get(STORE_KEYS.SERVER_CONNECTED, false) as boolean
const id = window.api.store.get(STORE_KEYS.ID) as string

const ConnectContext = createContext({} as ConnectContextType)

export function ConnectProvider({ children }: { children: ReactNode }): JSX.Element {
  const [serverConnected, setServerConnected] = useState(connected)
  const [telegramLinked, setTelegramLinked] = useState(linkedWithTelegram)
  const [castTV, setCastTV] = useState('')
  const [isProcess, setIsProcess] = useState('')
  const [mediaState, setMediaState] = useState<MediaState>('IDLE')
  const [castFileName, setCastFileName] = useState('')
  const { message } = useMessage()

  async function getDevices(): Promise<Array<string>> {
    return await ipcRenderer.invoke(EVENTS.GET_DEVICES)
  }

  function connectToDevice(name: string): void {
    setIsProcess(name)
    ipcRenderer.send(EVENTS.CONNECT_TO_DEVICE, name)
  }

  function disconnectFromDevice(): void {
    setIsProcess('disconnect')
    ipcRenderer.send(EVENTS.DISCONNECT_FROM_DEVICE)
  }

  useEffect(() => {
    ipcRenderer.on(EVENTS.DEVICE_CONNECTED, (_, deviceName) => {
      setCastTV(deviceName)
      setIsProcess('')
      message('success', `Connected to "${deviceName}"`)
    })

    ipcRenderer.on(EVENTS.DEVICE_CONNECTION_ERROR, (_, deviceName) => {
      setIsProcess('')
      message('warning', `Unable connect to "${deviceName}"`)
    })

    ipcRenderer.on(EVENTS.DEVICE_DISCONNECTED, () => {
      setCastTV('')
      setCastFileName('')
      setMediaState('IDLE')
      setIsProcess('')
      message('success', 'Disconnected')
    })

    ipcRenderer.on(EVENTS.DEVICE_DISCONNECTED_ERROR, () => {
      setIsProcess('')
      message('warning', 'Unable disconnect')
    })

    ipcRenderer.on(EVENTS.LINK_WITH_TELEGRAM, (_, msg) => {
      const linkWithTelegram = msg.data
      setTelegramLinked(linkWithTelegram)

      linkWithTelegram
        ? message('info', 'Linked with telegram')
        : message('info', 'Telegram unlinked')
    })

    ipcRenderer.on(EVENTS.SERVER_CONNECTED, (_, msg) => {
      const connectedValue = msg.data

      if (!connectedValue && serverConnected) message('info', 'Disconnected from the server')

      setServerConnected(connectedValue)

      if (connectedValue) message('info', 'Connected to the server')
    })

    ipcRenderer.on(EVENTS.MEDIA_STATE, (_, msg) => {
      const eventType = msg.data.type

      if (eventType !== 'MEDIA_STATUS') return

      let state: MediaState = msg.data?.status[0]?.playerState

      if (!state) return

      const connectScreen = msg.data?.status[0]?.media?.connectMedia

      if (connectScreen) state = 'CONNECTION_SCREEN'

      setMediaState(state)
    })

    ipcRenderer.on(EVENTS.BOT_STAGE_CHANGED, (_, msg) => {
      //message('info', msg.text)
    })

    return () => {
      ipcRenderer.removeAllListeners(EVENTS.DEVICE_CONNECTED)
      ipcRenderer.removeAllListeners(EVENTS.DEVICE_CONNECTION_ERROR)
      ipcRenderer.removeAllListeners(EVENTS.DEVICE_DISCONNECTED)
      ipcRenderer.removeAllListeners(EVENTS.DEVICE_DISCONNECTED_ERROR)
      ipcRenderer.removeAllListeners(EVENTS.LINK_WITH_TELEGRAM)
      ipcRenderer.removeAllListeners(EVENTS.SERVER_CONNECTED)
      ipcRenderer.removeAllListeners(EVENTS.MEDIA_STATE)
      ipcRenderer.removeAllListeners(EVENTS.BOT_STAGE_CHANGED)
    }
  }, [serverConnected, telegramLinked])

  return (
    <ConnectContext.Provider
      value={{
        serverConnected,
        telegramLinked,
        castTV,
        isProcess,
        id,
        mediaState,
        castFileName,
        setCastFileName,
        getDevices,
        connectToDevice,
        disconnectFromDevice
      }}
    >
      {children}
    </ConnectContext.Provider>
  )
}

export default function useConnect() {
  return useContext(ConnectContext)
}

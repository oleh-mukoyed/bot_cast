import { useMessage } from './useMessage'
import { EVENTS } from '@bot_cast/shared'
import { Updating } from '@renderer/shared/types'
import { useEffect, useState } from 'react'

const { ipcRenderer } = window.electron

export function useUpdate() {
  const [update, setUpdate] = useState<Updating>('none')
  const [progress, setProgress] = useState(0)
  const { message } = useMessage()

  useEffect(() => {
    ipcRenderer.on(EVENTS.UPDATE_CHECKING, () => {
      setUpdate('check')
    })

    ipcRenderer.on(EVENTS.UPDATE_AVAILABLE, () => {
      setUpdate('download')
    })

    ipcRenderer.on(EVENTS.UPDATE_NOT_AVAILABLE, () => {
      setUpdate('none')
    })

    ipcRenderer.on(EVENTS.UPDATE_PROGRESS, (_, progress) => {
      setProgress(progress)
    })

    ipcRenderer.on(EVENTS.UPDATE_DOWNLOADED, () => {
      message('info', 'Update downloaded')
    })

    ipcRenderer.on(EVENTS.UPDATE_ERROR, (_, error) => {
      message('error', error)
    })
  }, [])

  return { update, progress }
}

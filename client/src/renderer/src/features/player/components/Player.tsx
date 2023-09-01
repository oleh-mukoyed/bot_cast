import { checkFiles, getFileNameByUrl } from '../services/files'
import { ClearList } from './ClearList'
import { Playlist } from './Playlist'
import { ArrowUpOnSquareStackIcon } from '@heroicons/react/24/outline'
import useConnect from '@renderer/context/ConnectContext'
import { useMessage } from '@renderer/hooks/useMessage'
import { EVENTS, ALLOWED_FILE_TYPES, ALLOWED_FILE_TYPES_MIME } from '@bot_cast/shared'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

const { ipcRenderer } = window.electron

export function Player(): JSX.Element {
  const [fileList, setFileList] = useState<File[] | null>(null)
  const { message } = useMessage()
  const { castTV, castFileName, setCastFileName } = useConnect()

  useEffect(() => {
    ipcRenderer.on(EVENTS.CAST_STARTED, (_, url) => {
      const fileName = getFileNameByUrl(url)
      setCastFileName(fileName as string)
    })
    ipcRenderer.on(EVENTS.CAST_START_ERROR, () => {
      message('warning', "Can't cast video")
    })

    ipcRenderer.on(EVENTS.CAST_STOPPED, () => {
      setCastFileName('')
    })
    ipcRenderer.on(EVENTS.CAST_STOP_ERROR, () => {
      message('warning', "Can't stop casting")
    })

    return () => {
      ipcRenderer.removeAllListeners(EVENTS.CAST_STARTED)
      ipcRenderer.removeAllListeners(EVENTS.CAST_START_ERROR)
      ipcRenderer.removeAllListeners(EVENTS.CAST_STOPPED)
      ipcRenderer.removeAllListeners(EVENTS.CAST_STOP_ERROR)
    }
  }, [])

  function playHandler(filePath: string): void {
    if (!castTV) {
      message('warning', 'Cast device is not connected')
      return
    }

    const fileName = getFileNameByUrl(filePath)

    if (!castFileName || castFileName !== fileName) {
      ipcRenderer.send(EVENTS.CAST_LOCAL_FILE, filePath)
      return
    }

    ipcRenderer.send(EVENTS.PLAY_LOCAL_FILE)
  }

  function pauseHandler(): void {
    ipcRenderer.send(EVENTS.PAUSE_LOCAL_FILE)
  }

  function stopHandler(): void {
    ipcRenderer.send(EVENTS.STOP_CAST_LOCAL_FILE)
  }

  function preventDefaultHandler(e: React.DragEvent<HTMLElement>): void {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <div
        className={clsx(
          'cursor-pointer',
          'h-[120px] w-96 max-w-sm',
          'flex flex-col items-center justify-center',
          'rounded-lg drop-shadow-lg',
          'bg-base-200 p-6',
          'border border-transparent',
          'hover:border hover:border-dashed hover:border-primary-500 hover:text-primary-500',
          'dark:bg-d_base-200 dark:hover:border-d_primary-200 dark:hover:text-d_primary-200'
        )}
        onDragOver={(e) => {
          preventDefaultHandler(e)
        }}
        onDragEnter={(e) => {
          preventDefaultHandler(e)
        }}
        onDragLeave={(e) => {
          preventDefaultHandler(e)
        }}
        onDrop={(e) => {
          preventDefaultHandler(e)
          let files = checkFiles(Array.from(e.dataTransfer.files))
          if (fileList) files = [...fileList, ...files]
          setFileList(files)
        }}
        onClick={() => {
          document.getElementById('player-files')!.click()
        }}
      >
        <input
          type="file"
          id="player-files"
          onChange={(e) => {
            if (!e.target.files?.length) return
            let files = checkFiles(Array.from(e.target.files))
            if (fileList) files = [...fileList, ...files]
            setFileList(files)
          }}
          hidden
          multiple
          accept={ALLOWED_FILE_TYPES_MIME.join(',')}
        />
        <ArrowUpOnSquareStackIcon className="h-7 w-7" />
        <div className="my-class1 mt-2 text-sm font-semibold">Choose a File or drag it here</div>
        <div className="hover:text-danger text-xs">
          Allowed types: {ALLOWED_FILE_TYPES.join(', ')}
        </div>
      </div>
      {fileList && (
        <Playlist files={fileList} stop={stopHandler} play={playHandler} pause={pauseHandler} />
      )}
      {fileList && <ClearList clearHandler={() => setFileList(null)} />}
    </div>
  )
}

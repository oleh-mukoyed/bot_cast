import { PlayIcon, StopIcon, PauseIcon } from '@heroicons/react/24/solid'
import useConnect from '@renderer/context/ConnectContext'
import { prepareHostFileName } from '@bot_cast/shared'
import clsx from 'clsx'

export function Playlist({ files, play, pause, stop }): JSX.Element {
  const { mediaState, castFileName } = useConnect()

  return (
    <div
      className={clsx(
        'w-96',
        'scrollba',
        'rounded-lg drop-shadow-lg',
        'h-[200px] overflow-y-auto',
        'bg-base-200 p-2 pb-2 pt-2',
        'dark:bg-d_base-200'
      )}
    >
      {files.map((file, i) => {
        const currentName = prepareHostFileName(file.name)
        const showPlay = mediaState !== 'PLAYING' || currentName !== castFileName
        const showPause = currentName === castFileName && mediaState === 'PLAYING'
        const showStop =
          currentName === castFileName && (mediaState === 'PLAYING' || mediaState === 'PAUSED')

        return (
          <div
            className="relative cursor-pointer pl-1 text-sm leading-8 hover:rounded-md hover:bg-primary-500 hover:text-base-100"
            key={i}
          >
            {i + 1}. {file.name}
            <div className="absolute right-0 top-1/2 flex -translate-y-1/2 transform flex-row hover:bg-primary-500">
              {showPlay && (
                <PlayIcon
                  className="h-6 w-6 text-green-600 hover:text-green-700"
                  onClick={() => play(file.path)}
                />
              )}
              {showPause && (
                <PauseIcon className="h-6 w-6 text-base-100 hover:text-base-200" onClick={pause} />
              )}
              {showStop && (
                <StopIcon className="h-6 w-6 text-gray-950 hover:text-gray-800" onClick={stop} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

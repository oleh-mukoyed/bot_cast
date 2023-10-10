import { Update } from './components/Update'
import { useUpdate } from './hooks/useUpdate'
import { Disconnected } from './pages/Disconnected'
import { LinkTelegram } from './pages/LinkTelegram'
import { LocalFiles } from './pages/LocalFiles'
import useConnect from '@renderer/context/ConnectContext'

export function Home(): JSX.Element {
  const { serverConnected, telegramLinked, id } = useConnect()
  const { update, progress } = useUpdate()

  if (update !== 'none') return <Update progress={progress} stage={update} />

  return (
    <>
      {!serverConnected ? (
        <Disconnected />
      ) : !telegramLinked ? (
        <LinkTelegram id={id} />
      ) : (
        <LocalFiles />
      )}
    </>
  )
}

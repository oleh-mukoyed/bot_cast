import { Disconnected } from './pages/Disconnected'
import { LinkTelegram } from './pages/LinkTelegram'
import { LocalFiles } from './pages/LocalFiles'
import useConnect from '@renderer/context/ConnectContext'

export function Home(): JSX.Element {
  const { serverConnected, telegramLinked, id } = useConnect()

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

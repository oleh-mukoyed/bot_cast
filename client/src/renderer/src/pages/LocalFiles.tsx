import { CastDevices } from '@renderer/features/player/components/CastDevices'
import { Player } from '@renderer/features/player/components/Player'

export function LocalFiles(): JSX.Element {
  return (
    <>
      <CastDevices />
      <Player />
    </>
  )
}

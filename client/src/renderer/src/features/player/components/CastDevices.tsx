import { Menu, Transition } from '@headlessui/react'
import { TvIcon } from '@heroicons/react/24/solid'
import { LinkSpinner } from '@renderer/components/linkSpinner'
import useConnect from '@renderer/context/ConnectContext'
import clsx from 'clsx'
import { Fragment, useState } from 'react'

export function CastDevices(): JSX.Element {
  const { castTV, getDevices, connectToDevice, disconnectFromDevice, isProcess } = useConnect()
  const [devices, setDevices] = useState<Array<string>>([])

  const connectClass = castTV ? 'text-green-600 hover:text-green-700' : ''

  const menuClick = async () => {
    setDevices(await getDevices())
  }

  const castList = castTV ? (
    <Menu.Item key="0">
      <a
        href="#"
        onClick={disconnectFromDevice}
        className={clsx(
          'block px-4 py-2 text-sm',
          'hover:text-primary-500',
          'hover:dark:text-d_primary-200'
        )}
      >
        Disconnect from {castTV}
        {'disconnect' === isProcess && <LinkSpinner />}
      </a>
    </Menu.Item>
  ) : !devices.length ? (
    <Menu.Item key="0">
      <a
        href="#"
        className={clsx(
          'block px-4 py-2 text-sm',
          'hover:text-primary-500',
          'hover:dark:text-d_primary-200'
        )}
      >
        No devices found
      </a>
    </Menu.Item>
  ) : (
    devices.map((el, index) => {
      //if (el !== 'asd') return null
      const active = el === castTV
      return (
        <Menu.Item key={index}>
          <a
            href="#"
            onClick={() => connectToDevice(el)}
            className={clsx(
              active ? 'text-primary-500 dark:text-d_primary-200' : '',
              'block px-4 py-2 text-sm',
              'hover:text-primary-500',
              'hover:dark:text-d_primary-200'
            )}
          >
            {el}
            {el === isProcess && <LinkSpinner />}
          </a>
        </Menu.Item>
      )
    })
  )

  return (
    <Menu as="div" className="absolute right-5 top-5 inline-block text-left">
      <div>
        <Menu.Button onClick={menuClick}>
          <TvIcon
            className={clsx(
              'h-5 w-5 cursor-pointer hover:text-primary-500 hover:dark:text-d_primary-200',
              connectClass
            )}
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-base-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-d_base-200">
          <div className="py-1">{castList}</div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export function LinkTelegram({ id }): JSX.Element {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <ol className="border-l border-neutral-300 dark:border-neutral-500">
        <li>
          <div className="flex-start flex items-center pt-3">
            <div className="-ml-[5px] mr-3 h-[9px] w-[9px] rounded-full bg-neutral-300 dark:bg-neutral-500"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-300">1 step</p>
          </div>
          <div className="mb-6 ml-4 mt-2">
            <h4 className="mb-1.5 text-xl font-semibold">Open bot</h4>
            <p className="mb-3 text-neutral-500 dark:text-neutral-300">
              Go to the link{' '}
              <a
                href="https://t.me/chromecastRemoteControl_bot"
                target="_blank"
                className="font-bold text-primary-500 transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
              >
                BotCast
              </a>
            </p>
          </div>
        </li>
        <li>
          <div className="flex-start flex items-center pt-2">
            <div className="-ml-[5px] mr-3 h-[9px] w-[9px] rounded-full bg-neutral-300 dark:bg-neutral-500"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-300">2 step</p>
          </div>
          <div className="mb-6 ml-4 mt-2">
            <h4 className="mb-1.5 text-xl font-semibold">Start the bot</h4>
            <p className="mb-3 text-neutral-500 dark:text-neutral-300">
              Press{' '}
              <span className="font-bold text-primary-500 underline dark:text-primary-400">
                Start
              </span>{' '}
              button in telegram bot
            </p>
          </div>
        </li>
        <li>
          <div className="flex-start flex items-center pt-2">
            <div className="-ml-[5px] mr-3 h-[9px] w-[9px] rounded-full bg-neutral-300 dark:bg-neutral-500"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-300">3 step</p>
          </div>
          <div className="ml-4 mt-2 pb-5">
            <h4 className="mb-1.5 text-xl font-semibold">Enter code</h4>
            <p className="mb-3 text-neutral-500 dark:text-neutral-300">
              Enter code <span className="bg-primary-500 text-white dark:bg-primary-400">{id}</span>{' '}
              to the telegram bot text field and send it
            </p>
          </div>
        </li>
      </ol>
    </div>
  )
}

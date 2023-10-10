import { Updating } from '@renderer/shared/types'

export function Update({ progress, stage }: { progress: number; stage: Updating }): JSX.Element {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary-500 motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-primary-500"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Updating...
        </span>
      </div>
      <div className="pt-2">
        <h5 className="font-medium leading-tight">
          {stage === 'check' ? 'Checking for update' : `Updating... ${progress}%`}
        </h5>
      </div>
    </div>
  )
}

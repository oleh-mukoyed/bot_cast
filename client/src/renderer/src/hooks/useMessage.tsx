import clsx from 'clsx'
import { ToastOptions, toast as toastify } from 'react-toastify'

type Toast = 'info' | 'error' | 'success' | 'warning'

const options: ToastOptions = {
  position: 'top-left',
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: 'light',
  className: clsx(
    'text-sm',
    'bg-base-200 p-4 dark:bg-d_base-200',
    'text-base-200 dark:text-d_base-900 hover:text-primary-500 dark:hover:text-d_primary-200'
  )
}

export function useMessage() {
  const message = (type: Toast, text: string) => {
    switch (type) {
      case 'info': {
        toastify.info(text, options)
        break
      }
      case 'success': {
        toastify.success(text, options)
        break
      }
      case 'warning': {
        toastify.warn(text, options)
        break
      }
      case 'error': {
        toastify.error(text, options)
        break
      }
    }
  }

  return { message }
}

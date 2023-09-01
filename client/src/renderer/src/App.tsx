import { Home } from './Home'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { ToastContainer } from 'react-toastify'

export function App() {
  return (
    <div className="bg-base-100 dark:bg-d_base-50">
      <ToastContainer />
      <ThemeSwitcher />
      <Home />
    </div>
  )
}

import { App } from './App'
import './assets/styles/main.css'
import { ConnectProvider } from './context/ConnectContext'
import React from 'react'
import ReactDOM from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConnectProvider>
      <App />
    </ConnectProvider>
  </React.StrictMode>
)

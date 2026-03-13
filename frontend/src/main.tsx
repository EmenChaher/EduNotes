import AuthProvider from './context/AuthProvider'
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { store } from '@store/index.ts'
import { Provider } from 'react-redux'
import App from './app/App'
import React from 'react'
import './app/index.scss'
import * as serviceWorkerRegistration from "./serviceWorkerResgistration";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
)

serviceWorkerRegistration.register();
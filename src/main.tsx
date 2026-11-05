import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { LanguageProvider } from './i18n'
import { store } from './store/store'
import LiveFieldValidation from './components/LiveFieldValidation'
import { installApiErrorNormalization } from './utils/apiMessages'
import './index.css'

installApiErrorNormalization()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <App />
        <LiveFieldValidation />
        <Analytics />
      </LanguageProvider>
    </Provider>
  </StrictMode>,
)

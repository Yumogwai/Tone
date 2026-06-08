import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (no Google CDN call → no user IP leaks to a third party).
import '@fontsource/syne/600.css'
import '@fontsource/syne/700.css'
import '@fontsource/syne/800.css'
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

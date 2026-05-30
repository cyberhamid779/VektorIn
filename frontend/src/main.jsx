import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Fade out splash: wait for React paint + minimum 800ms display time
const splashStart = Date.now()
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const elapsed = Date.now() - splashStart
    const remaining = Math.max(0, 800 - elapsed)
    setTimeout(() => {
      const splash = document.getElementById('splash')
      if (splash) {
        splash.classList.add('hide')
        setTimeout(() => splash.remove(), 420)
      }
    }, remaining)
  })
})

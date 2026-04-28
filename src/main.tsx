import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { Pseudo3DDemoApp } from './app/Pseudo3DDemoApp'

const params = new URLSearchParams(window.location.search)
const showPseudo3DDemo = params.get('demo') === 'pseudo3d'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {showPseudo3DDemo ? <Pseudo3DDemoApp /> : <App />}
  </React.StrictMode>
)

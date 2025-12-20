import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// 👇 ESTA LÍNEA ES LA QUE TE FALTA O ESTÁ MAL 👇
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
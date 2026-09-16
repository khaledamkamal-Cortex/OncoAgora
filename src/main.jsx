import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'
import { bootstrap } from './lib/store'

// In live (Supabase) mode this loads content before the first paint settles;
// in demo mode it's a no-op. Either way we render immediately and the UI
// updates via the store subscription once data arrives.
bootstrap()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

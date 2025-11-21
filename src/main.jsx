import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import AppRoutes from './Routes.jsx'
import { ListaPacientes } from './pages/Pacientes/lista.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(

  <AppRoutes >
    <StrictMode>
      <Home />
    </StrictMode>
  </AppRoutes>
)

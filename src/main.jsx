import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home'
import AppRoutes from './Routes.jsx'



createRoot(document.getElementById('root')).render(

  <AppRoutes >
    <StrictMode>
      <Home />
    </StrictMode>
  </AppRoutes>
)

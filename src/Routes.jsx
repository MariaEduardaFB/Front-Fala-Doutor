import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import { ListaPacientes } from './pages/Pacientes/list-pacientes.jsx'
import { ListaMedicos } from './pages/Medicos/list-medicos.jsx'
import ListaAgendamentos from './pages/Agendamentos/list-agendamentos.jsx'


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/lista-pacientes' element={<ListaPacientes />} />
        <Route path='/lista-medicos' element={<ListaMedicos />} />
        <Route path='/agendamentos' element={<ListaAgendamentos />} />
        
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
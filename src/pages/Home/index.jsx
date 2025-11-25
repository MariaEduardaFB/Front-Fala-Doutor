import { useNavigate } from 'react-router-dom'
import './style.js'
import { Title, Button } from './style.js'

function Home() {
  const navigate = useNavigate()
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
        <Title>Fala Doutor</Title>
        <Button onClick={() => navigate('/lista-pacientes')}>Pacientes</Button>
        <Button onClick={() => navigate('/lista-medicos')}>Médicos</Button>
        </div>
    </>
  )
}

export default Home

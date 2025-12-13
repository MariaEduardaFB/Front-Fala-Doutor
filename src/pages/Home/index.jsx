
import { useNavigate } from 'react-router-dom'
import './style.js'
import { Container, Overlay, Title, Button, SecondaryButton, ButtonGroup, Content, Subtitle } from './style.js'
import { FaUser, FaStethoscope, FaCalendarAlt } from 'react-icons/fa'
import { RightStack } from './style.js'

function Home() {
  const navigate = useNavigate()
  return (
    <Container>
      <Overlay />
      <Content>
        <RightStack>
          <Title>Fala Doutor</Title>
          
          <ButtonGroup>
            <Button onClick={() => navigate('/lista-pacientes')}><FaUser size={18} /> Pacientes</Button>
            <SecondaryButton onClick={() => navigate('/lista-medicos')}><FaStethoscope size={18} /> Médicos</SecondaryButton>
            <Button onClick={() => navigate('/agendamentos')}><FaCalendarAlt size={18} /> Agendamentos</Button>
          </ButtonGroup>
        </RightStack>
      </Content>
    </Container>
  )
}

export default Home

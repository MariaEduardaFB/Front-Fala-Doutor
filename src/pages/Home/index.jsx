import { useState } from 'react'
import './style.js'
import { Title, Button } from './style.js'

function Home() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
        <Title>Fala Doutor</Title>
        <Button>Pacientes</Button>
        <Button>Médicos</Button>
        
      </div>
    </>
  )
}

export default Home

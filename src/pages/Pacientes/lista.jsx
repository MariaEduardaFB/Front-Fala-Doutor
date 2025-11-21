import { useState } from 'react'
import './style.js'
import { Title, Lista, PacienteItem} from './style.js'

function ListaPacientes() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Title>Lista de Pacientes</Title>
        <Lista>
            <PacienteItem>Paciente 1</PacienteItem>
        </Lista>
      </div>
    </>
  )
}

export { ListaPacientes }

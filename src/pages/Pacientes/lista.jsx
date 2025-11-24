// ...existing code...
import { useEffect, useState } from 'react'
import './style.js'
import { Title, Lista, PacienteItem, IconGroup, Button } from './style.js'
import { AiOutlineUser } from 'react-icons/ai'
import { FaRegEye, FaRegTrashAlt, FaPencilAlt, FaPlus } from 'react-icons/fa'
import PacienteModal from './PatientFormModal.jsx'

function ListaPacientes() {
    const [pacientes, setPacientes] = useState([])
    const [error, setError] = useState(null)

    
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('create') 
    const [selectedPaciente, setSelectedPaciente] = useState(null)

    
    async function fetchPacientes() {
        try {
            const response = await fetch('http://localhost:3000/pacientes')
            if (!response.ok) throw new Error('Erro ao buscar pacientes')
            const data = await response.json()
            setPacientes(data)
        } catch (err) {
            setError(err.message)
        }
    }

    useEffect(() => { fetchPacientes() }, [])

    if (error) return <div>Erro: {error}</div>

    // create
    async function createPaciente(formData) {
        try {
            const response = await fetch('http://localhost:3000/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!response.ok) throw new Error('Erro ao salvar paciente')
            const savedPaciente = await response.json()
            
            await fetchPacientes()
            setModalOpen(false)
        } catch (err) {
            setError(err.message)
        }
    }

   
    async function editPaciente(payload) {
        try {
            const res = await fetch(`http://localhost:3000/pacientes/${payload.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Erro ao atualizar paciente')
            const updated = await res.json()

            
            await fetchPacientes()

            
            if (selectedPaciente && (selectedPaciente.id ?? selectedPaciente._id) === (updated.id ?? updated._id)) {
                setSelectedPaciente(updated)
            }

            
            if (modalMode === 'create' || modalMode === 'edit') {
                setModalOpen(false)
            }
        } catch (err) {
            setError(err.message)
        }
    }

    
    async function deletePaciente(paciente) {
        try {
            const idToDelete = paciente.id ?? paciente._id
            const res = await fetch(`http://localhost:3000/pacientes/${idToDelete}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Erro ao excluir paciente')
            
            await fetchPacientes()
            setModalOpen(false)
        } catch (err) {
            setError(err.message)
        }
    }

    
    function openCreate() { setSelectedPaciente(null); setModalMode('create'); setModalOpen(true) }
    function openView(p) {
        const id = p.id ?? p._id
        const fresh = pacientes.find(item => (item.id ?? item._id) === id)
        setSelectedPaciente(fresh || p)
        setModalMode('view')
        setModalOpen(true)
    }
    function openEdit(p) {
        const id = p.id ?? p._id
        const fresh = pacientes.find(item => (item.id ?? item._id) === id)
        setSelectedPaciente(fresh || p)
        setModalMode('edit')
        setModalOpen(true)
    }
    function openDelete(p) {
        const id = p.id ?? p._id
        const fresh = pacientes.find(item => (item.id ?? item._id) === id)
        setSelectedPaciente(fresh || p)
        setModalMode('delete')
        setModalOpen(true)
    }

    
    async function handleSave(payload, mode) {
        if (mode === 'create') return await createPaciente(payload)
        if (mode === 'edit') return await editPaciente(payload)
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <PacienteModal
                    isOpen={modalOpen}
                    mode={modalMode}
                    paciente={selectedPaciente}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    onDelete={deletePaciente}
                />

                <Title>Lista de Pacientes</Title>

                <Button onClick={openCreate}>
                    <FaPlus
                        title="Adicionar"
                        style={{ color: '#FFFFFF', cursor: 'pointer', marginTop: '6px' }}
                    />Adicionar Paciente
                </Button>

                <Lista>
                    {pacientes.length === 0 ? (
                        <p>Nenhum paciente encontrado.</p>
                    ) : (
                        pacientes.map((paciente) => (
                            <PacienteItem key={paciente.id ?? paciente._id ?? paciente.email}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AiOutlineUser />
                                    <span style={{ textAlign: 'left' }}>{paciente.nome ?? 'Nome não disponível'}</span>
                                </div>

                                <IconGroup>
                                    <FaRegEye
                                        title="Ver"
                                        style={{ color: '#2b90ff', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#0b61b7')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#2b90ff')}
                                        onClick={() => openView(paciente)}
                                    />
                                    <FaPencilAlt
                                        title="Editar"
                                        style={{ color: '#f0ad4e', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#c6842b')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#f0ad4e')}
                                        onClick={() => openEdit(paciente)}
                                    />
                                    <FaRegTrashAlt
                                        title="Excluir"
                                        style={{ color: '#e74c3c', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#e74c3c')}
                                        onClick={() => openDelete(paciente)}
                                    />
                                </IconGroup>
                            </PacienteItem>
                        ))
                    )}
                </Lista>
            </div>
        </>
    )
}

export { ListaPacientes }

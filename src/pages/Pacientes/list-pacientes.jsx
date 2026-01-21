
import { useEffect, useState } from 'react'
import './style.js'
import { Title, Lista, PacienteItem, IconGroup, Button } from './style.js'
import { AiOutlineUser } from 'react-icons/ai'
import { FaRegEye, FaRegTrashAlt, FaPencilAlt, FaPlus } from 'react-icons/fa'
import PacienteModal from './paciente-form-modal.jsx'
import api from '../../services/api.js'

function ListaPacientes() {
    const [pacientes, setPacientes] = useState([])
    const [error, setError] = useState(null)


    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [selectedPaciente, setSelectedPaciente] = useState(null)


    async function fetchPacientes() {
        try {
            const res = await api.get('/pacientes?include=plano_saude')
            setPacientes(res.data)
        } catch (err) {
            console.error('fetchPacientes error:', err, err?.response?.data)
            setError(err?.response?.data?.message || err.message || 'Erro ao buscar pacientes')
        }
    }

    useEffect(() => { fetchPacientes() }, [])

    if (error) return <div>Erro: {error}</div>


    async function createPaciente(formData) {
        try {
            const response = await api.post('/pacientes', formData)
            console.log(response)
            if (response.status !== 201 && response.status !== 200) {
                const msg = response?.data?.message || response.statusText || 'Erro ao salvar paciente'
                console.error('createPaciente bad status:', response.status, response.data)
                throw new Error(msg)
            }
            await fetchPacientes()
            setModalOpen(false)

        } catch (err) {

            console.error('createPaciente error:', err, err?.response?.data)
            const message = err?.response?.data?.message || err.message || 'Erro ao salvar paciente'
            throw new Error(message)
        }

    }


    async function editPaciente(payload) {
        try {
            const res = await api.put(`/pacientes/${payload.id}`, payload)
            console.log(res)
            if (res.status !== 200) {
                const msg = res?.data?.message || res.statusText || 'Erro ao atualizar paciente'
                console.error('editPaciente bad status:', res.status, res.data)
                throw new Error(msg)
            }

            await fetchPacientes()
            if (selectedPaciente && (selectedPaciente.id ?? selectedPaciente._id) === (res.data.id ?? res.data._id)) {
                setSelectedPaciente(res.data)

                if (modalMode === 'create' || modalMode === 'edit') {
                    setModalOpen(false)
                }
            }
        } catch (err) {
            console.error('editPaciente error:', err, err?.response?.data)
            const message = err?.response?.data?.message || err.message || 'Erro ao atualizar paciente'
            throw new Error(message)
        }
    }


    async function deletePaciente(paciente) {
        try {
            const idToDelete = paciente.id ?? paciente._id
            const res = await api.delete(`/pacientes/${idToDelete}`)
            if (res.status !== 200 && res.status !== 204) {
                const msg = res?.data?.message || res.statusText || 'Erro ao excluir paciente'
                console.error('deletePaciente bad status:', res.status, res.data)
                throw new Error(msg)
            }

            await fetchPacientes()
            setModalOpen(false)
        } catch (err) {
            console.error('deletePaciente error:', err, err?.response?.data)
            const message = err?.response?.data?.message || err.message || 'Erro ao excluir paciente'
            throw new Error(message)
        }
    }


    function openCreate() { setSelectedPaciente(null); setModalMode('create'); setModalOpen(true) }
    function openView(p) {
        const id = p.id ?? p._id
        const fresh = pacientes.find(item => (item.id ?? item._id) === id)
        setSelectedPaciente(fresh || p)
        setModalMode('view')
        setModalOpen(true)
        // Buscar paciente com plano_saude
        api.get(`/pacientes/${id}`).then(res => {
            setSelectedPaciente(res.data)
        }).catch(err => {
            console.error('Erro ao buscar paciente:', err)
        })
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
                    onRefresh={fetchPacientes}
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

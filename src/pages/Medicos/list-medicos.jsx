import { useEffect, useState } from 'react'
import './style.js'
import { Title, Lista, PacienteItem, IconGroup, Button } from './style.js'
import { AiOutlineUser } from 'react-icons/ai'
import { FaRegEye, FaRegTrashAlt, FaPencilAlt, FaPlus } from 'react-icons/fa'
import MedicoModal from './medico-form-modal.jsx'
import api from '../../services/api.js'


function ListaMedicos() {
    const [medicos, setMedicos] = useState([])
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('create')
    const [selectedMedico, setSelectedMedico] = useState(null)

    async function fetchMedicos() {
        try {
            const res = await api.get('/medicos')
            setMedicos(res.data)
        } catch (err) {
            console.error('fetchMedicos error:', err, err?.response?.data)
            setError(err?.response?.data?.message || err.message || 'Erro ao buscar médicos')
        }
    }

    useEffect(() => { fetchMedicos() }, [])

    if (error) return <div>Erro: {error}</div>

    async function createMedico(formData) {
        try {
            const response = await api.post('/medicos', formData)
            console.log(response)
                if (response.status !== 201 && response.status !== 200) {
                    const msg = response?.data?.message || response.statusText || 'Erro ao salvar médico'
                    console.error('createMedico bad status:', response.status, response.data)
                    throw new Error(msg)
                }
                await fetchMedicos()
                setModalOpen(false)

            } catch (err) {
                console.error('createMedico error:', err, err?.response?.data)
                const message = err?.response?.data?.message || err.message || 'Erro ao salvar médico'
                throw new Error(message)
            }

    }

    async function editMedico(payload) {
        try {
            const res = await api.put(`/medicos/${payload.id}`, payload)
            console.log(res)
            if (res.status !== 200) {
                const msg = res?.data?.message || res.statusText || 'Erro ao atualizar médico'
                console.error('editMedico bad status:', res.status, res.data)
                throw new Error(msg)
            }

            await fetchMedicos()
            if (selectedMedico && (selectedMedico.id ?? selectedMedico._id) === (res.data.id ?? res.data._id)) {
                setSelectedMedico(res.data)
                if (modalMode === 'create' || modalMode === 'edit') {
                    setModalOpen(false)
                }
            }
        } catch (err) {
            console.error('editMedico error:', err, err?.response?.data)
            const message = err?.response?.data?.message || err.message || 'Erro ao atualizar médico'
            throw new Error(message)
        }
    }

    async function deleteMedico(medico) {
        try {
            const idToDelete = medico.id ?? medico._id
            const res = await api.delete(`/medicos/${idToDelete}`)
            if (res.status !== 200 && res.status !== 204) {
                const msg = res?.data?.message || res.statusText || 'Erro ao excluir médico'
                console.error('deleteMedico bad status:', res.status, res.data)
                throw new Error(msg)
            }
            await fetchMedicos()
            setModalOpen(false)
        } catch (err) {
            console.error('deleteMedico error:', err, err?.response?.data)
            const message = err?.response?.data?.message || err.message || 'Erro ao excluir médico'
            throw new Error(message)
        }
    }

    function openCreate() { setSelectedMedico(null); setModalMode('create'); setModalOpen(true) }
    function openView(m) {
        const id = m.id ?? m._id
        const fresh = medicos.find(item => (item.id ?? item._id) === id)
        setSelectedMedico(fresh || m)
        setModalMode('view')
        setModalOpen(true)
    }
    function openEdit(m) {
        const id = m.id ?? m._id
        const fresh = medicos.find(item => (item.id ?? item._id) === id)
        setSelectedMedico(fresh || m)
        setModalMode('edit')
        setModalOpen(true)
    }
    function openDelete(m) {
        const id = m.id ?? m._id
        const fresh = medicos.find(item => (item.id ?? item._id) === id)
        setSelectedMedico(fresh || m)
        setModalMode('delete')
        setModalOpen(true)
    }

    async function handleSave(payload, mode) {
        if (mode === 'create') return await createMedico(payload)
        if (mode === 'edit') return await editMedico(payload)
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MedicoModal
                    isOpen={modalOpen}
                    mode={modalMode}
                    medico={selectedMedico}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    onDelete={deleteMedico}
                />

                <Title>Lista de Médicos</Title>

                <Button onClick={openCreate}>
                    <FaPlus
                        title="Adicionar"
                        style={{ color: '#FFFFFF', cursor: 'pointer', marginTop: '6px' }}
                    />Adicionar Médico
                </Button>

                <Lista>
                    {medicos.length === 0 ? (
                        <p>Nenhum médico encontrado.</p>
                    ) : (
                        medicos.map((medico) => (
                            <PacienteItem key={medico.id ?? medico._id ?? medico.email}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AiOutlineUser />
                                    <span style={{ textAlign: 'left' }}>{medico.nome ?? 'Nome não disponível'}</span>
                                </div>

                                <IconGroup>
                                    <FaRegEye
                                        title="Ver"
                                        style={{ color: '#2b90ff', cursor: 'pointer' }}
                                        onClick={() => openView(medico)}
                                    />
                                    <FaPencilAlt
                                        title="Editar"
                                        style={{ color: '#f0ad4e', cursor: 'pointer' }}
                                        onClick={() => openEdit(medico)}
                                    />
                                    <FaRegTrashAlt
                                        title="Excluir"
                                        style={{ color: '#e74c3c', cursor: 'pointer' }}
                                        onClick={() => openDelete(medico)}
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

export { ListaMedicos }
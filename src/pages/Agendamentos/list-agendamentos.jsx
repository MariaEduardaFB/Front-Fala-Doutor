import { useEffect, useState } from 'react';
import {
  Title, Lista, AgendamentoItem, AgendamentoInfo, IconGroup, Button, StatusBadge
} from './style.js';
import { FaRegEye, FaRegTrashAlt, FaPencilAlt, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import AgendamentoModal from './agendamento-form-modal.jsx';
import api from '../../services/api.js';

function ListaAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  async function fetchAgendamentos() {
    try {
      const res = await api.get('/consultas');
      setAgendamentos(res.data);
    } catch (err) {
      console.error('fetchAgendamentos error:', err, err?.response?.data);
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar agendamentos');
    }
  }

  useEffect(() => { fetchAgendamentos(); }, []);

  if (error) return <div>Erro: {error}</div>;

  async function createAgendamento(formData) {
    try {
      const response = await api.post('/consultas', formData);
      if (response.status !== 201 && response.status !== 200) {
        const msg = response?.data?.message || response.statusText || 'Erro ao salvar agendamento';
        console.error('createAgendamento bad status:', response.status, response.data);
        throw new Error(msg);
      }
      await fetchAgendamentos();
      setModalOpen(false);
    } catch (err) {
      console.error('createAgendamento error:', err, err?.response?.data);
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Erro ao salvar agendamento';
      throw new Error(message);
    }
  }

  async function editAgendamento(payload) {
    try {
      const res = await api.put(`/consultas/${payload.id}`, payload);
      if (res.status !== 200) {
        const msg = res?.data?.message || res.statusText || 'Erro ao atualizar agendamento';
        console.error('editAgendamento bad status:', res.status, res.data);
        throw new Error(msg);
      }
      await fetchAgendamentos();
      setModalOpen(false);
    } catch (err) {
      console.error('editAgendamento error:', err, err?.response?.data);
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Erro ao atualizar agendamento';
      throw new Error(message);
    }
  }

  async function deleteAgendamento(agendamento) {
    try {
      const idToDelete = agendamento.id ?? agendamento._id;
      const res = await api.delete(`/consultas/${idToDelete}`);
      if (res.status !== 200 && res.status !== 204) {
        const msg = res?.data?.message || res.statusText || 'Erro ao excluir agendamento';
        console.error('deleteAgendamento bad status:', res.status, res.data);
        throw new Error(msg);
      }
      await fetchAgendamentos();
      setModalOpen(false);
    } catch (err) {
      console.error('deleteAgendamento error:', err, err?.response?.data);
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Erro ao excluir agendamento';
      throw new Error(message);
    }
  }

  function openCreate() {
    setSelectedAgendamento(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function openView(a) {
    setSelectedAgendamento(a);
    setModalMode('view');
    setModalOpen(true);
  }

  function openEdit(a) {
    setSelectedAgendamento(a);
    setModalMode('edit');
    setModalOpen(true);
  }

  function openDelete(a) {
    setSelectedAgendamento(a);
    setModalMode('delete');
    setModalOpen(true);
  }

  async function handleSave(payload, mode) {
    if (mode === 'create') return await createAgendamento(payload);
    if (mode === 'edit') return await editAgendamento(payload);
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function translateStatus(status) {
    const statusMap = {
      'agendada': 'Agendada',
      'realizada': 'Realizada',
      'cancelada': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AgendamentoModal
          isOpen={modalOpen}
          mode={modalMode}
          agendamento={selectedAgendamento}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={deleteAgendamento}
        />

        <Title>Agendamentos</Title>

        <Button onClick={openCreate}>
          <FaPlus
            title="Adicionar"
            style={{ color: '#FFFFFF', cursor: 'pointer' }}
          />
          Agendar Consulta
        </Button>

        <Lista>
          {agendamentos.length === 0 ? (
            <p>Nenhum agendamento encontrado.</p>
          ) : (
            agendamentos.map((agendamento) => (
              <AgendamentoItem key={agendamento.id ?? agendamento._id}>
                <FaCalendarAlt style={{ fontSize: '1.5rem', color: '#020054' }} />
                
                <AgendamentoInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{agendamento.Paciente?.nome || 'N/A'}</strong>
                    <span>→</span>
                    <span>{agendamento.Medico?.nome || 'N/A'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {formatDateTime(agendamento.data_hora)}
                  </div>
                  {agendamento.descricao && (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                      {agendamento.descricao.substring(0, 60)}
                      {agendamento.descricao.length > 60 ? '...' : ''}
                    </div>
                  )}
                </AgendamentoInfo>

                <StatusBadge $status={agendamento.status}>
                  {translateStatus(agendamento.status)}
                </StatusBadge>

                <IconGroup>
                  <FaRegEye
                    title="Ver"
                    style={{ color: '#2b90ff', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0b61b7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#2b90ff')}
                    onClick={() => openView(agendamento)}
                  />
                  <FaPencilAlt
                    title="Editar"
                    style={{ color: '#f0ad4e', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c6842b')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#f0ad4e')}
                    onClick={() => openEdit(agendamento)}
                  />
                  <FaRegTrashAlt
                    title="Excluir"
                    style={{ color: '#e74c3c', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#e74c3c')}
                    onClick={() => openDelete(agendamento)}
                  />
                </IconGroup>
              </AgendamentoItem>
            ))
          )}
        </Lista>
      </div>
    </>
  );
}

export default ListaAgendamentos;

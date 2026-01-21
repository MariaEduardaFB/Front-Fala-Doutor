import { useEffect, useState } from 'react';
import {
  Title, Lista, AgendamentoItem, AgendamentoInfo, IconGroup, Button, StatusBadge,
  FilterGroup, FilterButton, DateInput
} from './style.js';
import { FaRegEye, FaRegTrashAlt, FaPencilAlt, FaPlus, FaCalendarAlt, FaChartBar } from 'react-icons/fa';
import AgendamentoModal from './agendamento-form-modal.jsx';
import RelatorioModal from './relatorio-modal.jsx';
import api from '../../services/api.js';
import {
  buscaInicioSemana,
  buscaInicioMes,
  buscaInicioAno,
} from "../../assets/utils/datas";

function ListaAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);


  async function fetchAgendamentos(inicio = null, fim = null) {
    try {
      let url = '/consultas';
      const params = {};
      if (inicio && fim) {
        params.dataInicial = inicio;
        params.dataFinal = fim;
      }
      const res = await api.get(url, { params });
      setAgendamentos(res.data);
    } catch (err) {
      console.error('fetchAgendamentos error:', err, err?.response?.data);
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar agendamentos');
    }
  }

  useEffect(() => {
  fetchAgendamentos();
  fetchPacientes();
  fetchMedicos();
}, []);

async function fetchPacientes() {
  const res = await api.get('/pacientes');
  setPacientes(res.data);
}

async function fetchMedicos() {
  const res = await api.get('/medicos');
  setMedicos(res.data);
}



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

  function handleFiltroDia() {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(hoje);
    fim.setHours(23, 59, 59, 999);
    const dataInicialStr = inicio.toISOString().slice(0, 10);
    const dataFinalStr = fim.toISOString().slice(0, 10);
    setDataInicial(dataInicialStr);
    setDataFinal(dataFinalStr);
    fetchAgendamentos(dataInicialStr, dataFinalStr);
  }

  function handleFiltroSemana() {
    const inicio = buscaInicioSemana(new Date());
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 6);
    fim.setHours(23, 59, 59, 999);
    const dataInicialStr = inicio.toISOString().slice(0, 10);
    const dataFinalStr = fim.toISOString().slice(0, 10);
    setDataInicial(dataInicialStr);
    setDataFinal(dataFinalStr);
    fetchAgendamentos(dataInicialStr, dataFinalStr);
  }

  function handleFiltroMes() {
    const inicio = buscaInicioMes(new Date());
    const fim = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0);
    fim.setHours(23, 59, 59, 999);
    const dataInicialStr = inicio.toISOString().slice(0, 10);
    const dataFinalStr = fim.toISOString().slice(0, 10);
    setDataInicial(dataInicialStr);
    setDataFinal(dataFinalStr);
    fetchAgendamentos(dataInicialStr, dataFinalStr);
  }

  function handleFiltroAno() {
    const inicio = buscaInicioAno(new Date());
    const fim = new Date(inicio.getFullYear(), 11, 31);
    fim.setHours(23, 59, 59, 999);
    const dataInicialStr = inicio.toISOString().slice(0, 10);
    const dataFinalStr = fim.toISOString().slice(0, 10);
    setDataInicial(dataInicialStr);
    setDataFinal(dataFinalStr);
    fetchAgendamentos(dataInicialStr, dataFinalStr);
  }

  function handleDataInicialChange(e) {
    const newDataInicial = e.target.value;
    setDataInicial(newDataInicial);
    if (newDataInicial && dataFinal) {
      fetchAgendamentos(newDataInicial, dataFinal);
    }
  }

  function handleDataFinalChange(e) {
    const newDataFinal = e.target.value;
    setDataFinal(newDataFinal);
    if (dataInicial && newDataFinal) {
      fetchAgendamentos(dataInicial, newDataFinal);
    }
  }

  function handleLimparFiltros() {
    setDataInicial("");
    setDataFinal("");
    fetchAgendamentos();

  }

  function getNomePaciente(id) {
  return pacientes.find(p => p.id === id)?.nome || 'N/A';
}

function getNomeMedico(id) {
  return medicos.find(m => m.id === id)?.nome || 'N/A';
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

        <RelatorioModal
          isOpen={relatorioModalOpen}
          onClose={() => setRelatorioModalOpen(false)}
        />

        <Title>Agendamentos</Title>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <Button onClick={openCreate}>
            <FaPlus style={{ color: '#FFFFFF' }} />
            Agendar Consulta
          </Button>
          <Button onClick={() => setRelatorioModalOpen(true)}>
            <FaChartBar style={{ color: '#FFFFFF' }} />
            Relatórios
          </Button>
        </div>

        <FilterGroup>
          <FilterButton onClick={handleFiltroDia}>Esse dia</FilterButton>
          <FilterButton onClick={handleFiltroSemana}>Essa semana</FilterButton>
          <FilterButton onClick={handleFiltroMes}>Esse mês</FilterButton>
          <FilterButton onClick={handleFiltroAno}>Esse ano</FilterButton>
          <DateInput 
            type="date" 
            value={dataInicial} 
            onChange={handleDataInicialChange}
            placeholder="Data Inicial"
          />
          <DateInput 
            type="date" 
            value={dataFinal} 
            onChange={handleDataFinalChange}
            placeholder="Data Final"
          />
          {(dataInicial || dataFinal) && (
            <FilterButton onClick={handleLimparFiltros} style={{ background: '#e74c3c' }}>
              Limpar
            </FilterButton>
          )}
        </FilterGroup>

        <Lista>
          {agendamentos.length === 0 ? (
            <p>Nenhum agendamento encontrado.</p>
          ) : (
            agendamentos.map((agendamento) => (
              <AgendamentoItem key={agendamento.id ?? agendamento._id}>
                <FaCalendarAlt style={{ fontSize: '1.5rem', color: '#020054' }} />
                
                <AgendamentoInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{getNomePaciente(agendamento.paciente_id)}</strong>
<span>→</span>
<span>{getNomeMedico(agendamento.medico_id)}</span>

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

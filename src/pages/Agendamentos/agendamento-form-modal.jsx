import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Select, TextArea,
  Actions, Primary, Secondary, TitleModal, FieldLabel, LabelText,
  ErrorMessage, InfoMessage
} from './style.js';
import api from '../../services/api.js';

function AgendamentoModal({ mode = 'create', agendamento = null, isOpen, onClose, onSave, onDelete }) {
  const ref = useRef(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('agendada');
  const [errorMsg, setErrorMsg] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchPacientes();
      fetchMedicos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'create') {
      setPacienteId('');
      setMedicoId('');
      setDataHora('');
      setDescricao('');
      setStatus('agendada');
      setErrorMsg('');
      setPacienteSelecionado(null);
    } else if (agendamento) {
      setPacienteId(agendamento.paciente_id || agendamento.Paciente?.id || '');
      setMedicoId(agendamento.medico_id || agendamento.Medico?.id || '');
      
      // Formatar data para datetime-local
      if (agendamento.data_hora) {
        const data = new Date(agendamento.data_hora);
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        setDataHora(`${ano}-${mes}-${dia}T${hora}:${minuto}`);
      }
      
      setDescricao(agendamento.descricao || '');
      setStatus(agendamento.status || 'agendada');
      setErrorMsg('');
    }
  }, [isOpen, mode, agendamento]);

  async function fetchPacientes() {
    try {
      const res = await api.get('/pacientes');
      setPacientes(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  }

  async function fetchMedicos() {
    try {
      const res = await api.get('/medicos');
      setMedicos(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  }

  useEffect(() => {
    if (pacienteId) {
      const paciente = pacientes.find(p => p.id == pacienteId);
      setPacienteSelecionado(paciente);
    } else {
      setPacienteSelecionado(null);
    }
  }, [pacienteId, pacientes]);

  const verificarPlanoAtivo = () => {
    if (!pacienteSelecionado) return false;
    
    const plano = pacienteSelecionado.PlanoSaude;
    if (!plano) return false;
    
    if (plano.status) {
      return plano.status === 'ativo';
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(plano.validade);
    validade.setHours(23, 59, 59, 999);
    return validade >= hoje;
  };

  const planoAtivo = verificarPlanoAtivo();

  if (!isOpen) return null;

  function handleOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'delete') {
      try {
        if (onDelete) await onDelete(agendamento);
        onClose?.();
      } catch (err) {
        setErrorMsg(err?.message || 'Erro ao excluir agendamento.');
      }
      return;
    }

    if (!pacienteId) {
      setErrorMsg('Por favor, selecione um paciente.');
      return;
    }

    if (!medicoId) {
      setErrorMsg('Por favor, selecione um médico.');
      return;
    }

    if (!dataHora) {
      setErrorMsg('Por favor, selecione data e hora.');
      return;
    }

    if (!pacienteSelecionado?.PlanoSaude) {
      setErrorMsg('Paciente não possui plano de saúde. Não é possível agendar consulta.');
      return;
    }

    if (!planoAtivo) {
      setErrorMsg('Paciente com plano de saúde inativo. Não é possível agendar consulta.');
      return;
    }

    const payload = {
      ...(agendamento?.id ? { id: agendamento.id } : {}),
      paciente_id: parseInt(pacienteId),
      medico_id: parseInt(medicoId),
      data_hora: new Date(dataHora).toISOString(),
      descricao: descricao.trim() || null,
      status: status
    };

    try {
      if (onSave) await onSave(payload, mode);
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.message || err?.response?.data?.error || 'Erro ao salvar agendamento.');
      console.error('handleSubmit error:', err, err?.response?.data || err?.message);
    }
  }

  const readOnly = mode === 'view' || mode === 'delete';
  const title = mode === 'create' ? 'Agendar Consulta' : 
                mode === 'edit' ? 'Editar Agendamento' : 
                mode === 'view' ? 'Visualizar Agendamento' : 'Excluir Agendamento';

  return (
    <Overlay onMouseDown={handleOutside}>
      <ModalBox ref={ref} onMouseDown={(e) => e.stopPropagation()}>
        <Header>
          <TitleModal>{title}</TitleModal>
          <CloseBtn onClick={onClose} aria-label="Close">✕</CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FieldLabel>
            <LabelText>Paciente *</LabelText>
            <Select 
              value={pacienteId} 
              onChange={(e) => setPacienteId(e.target.value)}
              disabled={readOnly || mode === 'edit'}
              required
            >
              <option value="">Selecione um paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} - {p.cpf}
                </option>
              ))}
            </Select>
          </FieldLabel>

          {pacienteSelecionado && !pacienteSelecionado.PlanoSaude && (
            <ErrorMessage>
              ⚠️ Este paciente não possui plano de saúde. Não é possível agendar consulta.
            </ErrorMessage>
          )}

          {pacienteSelecionado && pacienteSelecionado.PlanoSaude && !planoAtivo && (
            <ErrorMessage>
              ⚠️ Paciente com plano de saúde vencido. Não é possível agendar consulta.
            </ErrorMessage>
          )}

          {pacienteSelecionado && pacienteSelecionado.PlanoSaude && planoAtivo && (
            <InfoMessage>
              ✓ Paciente com plano de saúde ativo: {pacienteSelecionado.PlanoSaude.nome}
            </InfoMessage>
          )}

          <FieldLabel>
            <LabelText>Médico *</LabelText>
            <Select 
              value={medicoId} 
              onChange={(e) => setMedicoId(e.target.value)}
              disabled={readOnly || mode === 'edit'}
              required
            >
              <option value="">Selecione um médico</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nome} - CRM: {m.crm}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <FieldLabel>
            <LabelText>Data e Hora *</LabelText>
            <Input 
              type="datetime-local"
              value={dataHora} 
              onChange={(e) => setDataHora(e.target.value)}
              disabled={readOnly}
              required
            />
          </FieldLabel>

          <FieldLabel>
            <LabelText>Descrição</LabelText>
            <TextArea 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)}
              disabled={readOnly}
              placeholder="Digite os detalhes da consulta..."
            />
          </FieldLabel>

          {mode !== 'create' && (
            <FieldLabel>
              <LabelText>Status *</LabelText>
              <Select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                disabled={readOnly}
                required
              >
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </Select>
            </FieldLabel>
          )}

          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

          <Actions>
            <Secondary type="button" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Secondary>

            {mode !== 'view' && (
              <Primary 
                type="submit"
                disabled={mode === 'create' && pacienteSelecionado && (!pacienteSelecionado.PlanoSaude || !planoAtivo)}
              >
                {mode === 'delete' ? 'Confirmar exclusão' : (mode === 'edit' ? 'Salvar alterações' : 'Agendar')}
              </Primary>
            )}
          </Actions>
        </Form>
      </ModalBox>
    </Overlay>
  );
}

export default AgendamentoModal;

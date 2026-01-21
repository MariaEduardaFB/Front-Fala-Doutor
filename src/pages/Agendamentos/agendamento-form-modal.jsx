import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Select, TextArea,
  Actions, Primary, Secondary, TitleModal, FieldLabel, LabelText,
  ErrorMessage, InfoMessage
} from './style.js';
import api from '../../services/api.js';

function AgendamentoModal({
  mode = 'create',
  agendamento = null,
  isOpen,
  onClose,
  onSave
}) {
  const ref = useRef(null);

  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const [pacienteId, setPacienteId] = useState('');
  const [medicoId, setMedicoId] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('agendada');

  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [planoSaude, setPlanoSaude] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

 
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);


  useEffect(() => {
    if (!isOpen) return;

    api.get('/pacientes').then(res => setPacientes(res.data));
    api.get('/medicos').then(res => setMedicos(res.data));
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'create') {
      setPacienteId('');
      setMedicoId('');
      setDataHora('');
      setDescricao('');
      setStatus('agendada');
      setPacienteSelecionado(null);
      setPlanoSaude(null);
      setErrorMsg('');
      return;
    }

    if (agendamento) {
      setPacienteId(String(agendamento.paciente_id));
      setMedicoId(String(agendamento.medico_id));
      setDescricao(agendamento.descricao || '');
      setStatus(agendamento.status || 'agendada');

      if (agendamento.data_hora) {
        const d = new Date(agendamento.data_hora);
        setDataHora(d.toISOString().slice(0, 16));
      }
    }
  }, [isOpen, mode, agendamento]);


  useEffect(() => {
    if (!pacienteId) {
      setPacienteSelecionado(null);
      return;
    }

    const paciente = pacientes.find(p => p.id === Number(pacienteId));
    setPacienteSelecionado(paciente || null);
  }, [pacienteId, pacientes]);


  useEffect(() => {
    async function buscarPlano() {
      if (!pacienteSelecionado?.plano_id) {
        setPlanoSaude(null);
        return;
      }

      try {
        const res = await api.get(`/plano_saude/${pacienteSelecionado.plano_id}`);
        setPlanoSaude(res.data);
      } catch {
        setPlanoSaude(null);
      }
    }

    buscarPlano();
  }, [pacienteSelecionado]);

 
  const planoAtivo = (() => {
    if (!planoSaude?.validade) return false;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const validade = new Date(planoSaude.validade);
    validade.setHours(23, 59, 59, 999);

    return validade >= hoje;
  })();

  if (!isOpen) return null;

  function handleOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) onClose();
  }

  const readOnly = mode === 'view' || mode === 'delete';


  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!pacienteId) return setErrorMsg('Selecione um paciente.');
    if (!medicoId) return setErrorMsg('Selecione um médico.');
    if (!dataHora) return setErrorMsg('Selecione data e hora.');
    if (!planoSaude) return setErrorMsg('Paciente não possui plano.');
    if (!planoAtivo) return setErrorMsg('Plano vencido.');

    const payload = {
  id: agendamento?.id, // <--- ADICIONAR ESSA LINHA
  paciente_id: Number(pacienteId),
  medico_id: Number(medicoId),
  data_hora: new Date(dataHora).toISOString(),
  descricao: descricao || null,
  status
};

    try {
      await onSave(payload, mode, agendamento);
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Erro ao salvar consulta.');
    }
  }


  return (
    <Overlay onMouseDown={handleOutside}>
      <ModalBox ref={ref} onMouseDown={e => e.stopPropagation()}>
        <Header>
          <TitleModal>
            {mode === 'edit' ? 'Editar Consulta' : 'Agendar Consulta'}
          </TitleModal>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FieldLabel>
            <LabelText>Paciente *</LabelText>
            <Select value={pacienteId} onChange={e => setPacienteId(e.target.value)} disabled={readOnly}>
              <option value="">Selecione</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </Select>
          </FieldLabel>

          {planoSaude && (
            planoAtivo
              ? <InfoMessage>Plano ativo: {planoSaude.nome}</InfoMessage>
              : <ErrorMessage>Plano vencido</ErrorMessage>
          )}

          <FieldLabel>
            <LabelText>Médico *</LabelText>
            <Select value={medicoId} onChange={e => setMedicoId(e.target.value)} disabled={readOnly}>
              <option value="">Selecione</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </Select>
          </FieldLabel>

          <FieldLabel>
            <LabelText>Data e Hora *</LabelText>
            <Input type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          <FieldLabel>
            <LabelText>Status *</LabelText>
            <Select value={status} onChange={e => setStatus(e.target.value)} disabled={readOnly}>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
            </Select>
          </FieldLabel>

          <FieldLabel>
            <LabelText>Descrição</LabelText>
            <TextArea value={descricao} onChange={e => setDescricao(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

          <Actions>
            <Secondary type="button" onClick={onClose}>Cancelar</Secondary>
            {!readOnly && (
              <Primary type="submit" disabled={!planoAtivo}>
                {mode === 'edit' ? 'Salvar' : 'Agendar'}
              </Primary>
            )}
          </Actions>
        </Form>
      </ModalBox>
    </Overlay>
  );
}

export default AgendamentoModal;

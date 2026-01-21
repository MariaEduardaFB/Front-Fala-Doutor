import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Actions,
  Primary, Secondary, TitleModal, FieldLabel, LabelText,
  PlanoInfo, PlanoBadge, PlanoBtn
} from './style.js';
import api from '../../services/api.js';

function PacienteModal({
  mode = 'create',
  paciente = null,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onRefresh
}) {
  const ref = useRef(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [mostrarFormPlano, setMostrarFormPlano] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState(false);

  const [planoNome, setPlanoNome] = useState('');
  const [planoOperadora, setPlanoOperadora] = useState('');
  const [planoValidade, setPlanoValidade] = useState('');

  /* =======================
     EFEITOS
  ======================= */

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'create') {
      setNome('');
      setCpf('');
      setTelefone('');
    } else if (paciente) {
      setNome(paciente.nome || '');
      setCpf(paciente.cpf || '');
      setTelefone(paciente.telefone || '');
    }

    setErrorMsg('');
    setMostrarFormPlano(false);
    setEditandoPlano(false);
    setPlanoNome('');
    setPlanoOperadora('');
    setPlanoValidade('');
  }, [isOpen, mode, paciente]);

  if (!isOpen) return null;



  function handleOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  }

  const planoData = paciente?.planoSaude;

  const getPlanoStatus = () => {
    if (!planoData) return null;

    const validade = new Date(planoData.validade);
    validade.setHours(23, 59, 59, 999);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return validade >= hoje;
  };

  const planoAtivo = getPlanoStatus();



  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'delete') {
      try {
        await onDelete?.(paciente);
        onClose?.();
      } catch {
        setErrorMsg('Erro ao excluir paciente.');
      }
      return;
    }

    if (!cpf.trim()) {
      setErrorMsg('CPF é obrigatório.');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      setErrorMsg('CPF precisa ter 11 dígitos.');
      return;
    }

    try {
      await onSave?.(
        {
          id: paciente?.id,
          nome: nome.trim() || 'Nome não informado',
          cpf: cpf.trim(),
          telefone: telefone.trim() || null
        },
        mode
      );
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Erro ao salvar paciente.');
    }
  }



  async function cadastrarPlano() {
    if (!planoNome || !planoOperadora || !planoValidade) {
      setErrorMsg('Preencha todos os campos do plano.');
      return;
    }

    try {
      const { data } = await api.post('/plano_saude', {
        nome: planoNome,
        operadora: planoOperadora,
        validade: planoValidade
      });

      await api.put(`/pacientes/${paciente.id}`, {
        plano_id: data.id
      });

      await onRefresh?.();
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Erro ao cadastrar plano.');
    }
  }


  const readOnly = mode === 'view' || mode === 'delete';

  const title =
    mode === 'create' ? 'Cadastrar Paciente'
      : mode === 'edit' ? 'Editar Paciente'
        : mode === 'view' ? 'Visualizar Paciente'
          : 'Excluir Paciente';

  return (
    <Overlay onMouseDown={handleOutside}>
      <ModalBox ref={ref} onMouseDown={(e) => e.stopPropagation()}>
        <Header>
          <TitleModal>{title}</TitleModal>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FieldLabel>
            <LabelText>Nome</LabelText>
            <Input value={nome} onChange={e => setNome(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          <FieldLabel>
            <LabelText>CPF</LabelText>
            <Input value={cpf} onChange={e => setCpf(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          <FieldLabel>
            <LabelText>Telefone</LabelText>
            <Input value={telefone} onChange={e => setTelefone(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          {mode === 'view' && (
            <PlanoInfo>
              {planoData ? (
                <>
                  <PlanoBadge $ativo={planoAtivo}>
                    {planoAtivo ? 'Ativo' : 'Inativo'}
                  </PlanoBadge>

                  {!planoAtivo && (
                    <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      Plano vencido. Não é possível agendar consultas.
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem' }}>
                    <div><strong>Plano:</strong> {planoData.nome}</div>
                    <div><strong>Operadora:</strong> {planoData.operadora}</div>
                    <div><strong>Validade:</strong> {new Date(planoData.validade).toLocaleDateString('pt-BR')}</div>
                  </div>
                </>
              ) : (
                <PlanoBtn type="button" onClick={() => setMostrarFormPlano(true)}>
                  Cadastrar Plano
                </PlanoBtn>
              )}
            </PlanoInfo>
          )}

          {mostrarFormPlano && (
            <PlanoInfo>
              <FieldLabel>
                <LabelText>Nome do Plano</LabelText>
                <Input value={planoNome} onChange={e => setPlanoNome(e.target.value)} />
              </FieldLabel>

              <FieldLabel>
                <LabelText>Operadora</LabelText>
                <Input value={planoOperadora} onChange={e => setPlanoOperadora(e.target.value)} />
              </FieldLabel>

              <FieldLabel>
                <LabelText>Validade</LabelText>
                <Input type="date" value={planoValidade} onChange={e => setPlanoValidade(e.target.value)} />
              </FieldLabel>

              <Actions>
                <Primary type="button" onClick={cadastrarPlano}>Salvar Plano</Primary>
                <Secondary type="button" onClick={() => setMostrarFormPlano(false)}>Cancelar</Secondary>
              </Actions>
            </PlanoInfo>
          )}

          {errorMsg && <div style={{ color: '#c0392b', textAlign: 'center' }}>{errorMsg}</div>}

          <Actions>
            <Secondary type="button" onClick={onClose}>Fechar</Secondary>
            {mode !== 'view' && <Primary type="submit">Salvar</Primary>}
          </Actions>
        </Form>
      </ModalBox>
    </Overlay>
  );
}

export default PacienteModal;

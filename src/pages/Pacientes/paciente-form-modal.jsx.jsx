import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Actions,
  Primary, Secondary, TitleModal, FieldLabel, LabelText
} from './style.js'


function PacienteModal({ mode = 'create', paciente = null, isOpen, onClose, onSave, onDelete }) {
  const ref = useRef(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);


  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'create') {
      setNome(''); setCpf(''); setTelefone(''); setErrorMsg('');
    } else if (paciente) {
      setNome(paciente.nome || '');
      setCpf(paciente.cpf || '');
      setTelefone(paciente.telefone || '');
      setErrorMsg('');
    }
  }, [isOpen, mode, paciente]);

  if (!isOpen) return null;

  function handleOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'delete') {
      try {
        if (onDelete) await onDelete(paciente);
        onClose?.();
      } catch (err) {
        setErrorMsg(err?.message || 'Erro ao excluir paciente.');
      }
      return;
    }

  
    if (!cpf.trim()) { setErrorMsg('CPF é obrigatório.'); return; }
    const onlyDigitsCpf = cpf.replace(/\D/g, '')
    if (onlyDigitsCpf.length !== 11) { setErrorMsg('CPF precisa ter 11 dígitos.'); return }

    const payload = {
      ... (paciente?.id ? { id: paciente.id } : {}),
      nome: nome.trim() || 'Nome não informado',
      cpf: cpf.trim(),
      telefone: telefone.trim() || null
    };

    try {
      if (onSave) await onSave(payload, mode);
      onClose?.();
    } catch (err) {
      
      setErrorMsg(err?.message || err?.response?.data?.message || 'Erro ao salvar paciente.');
      console.error('handleSubmit error:', err, err?.response?.data || err?.message);
    }
  }

  const readOnly = mode === 'view' || mode === 'delete';
  const title = mode === 'create' ? 'Cadastrar Paciente' : mode === 'edit' ? 'Editar Paciente' : mode === 'view' ? 'Visualizar Paciente' : 'Excluir Paciente';

  return (
    <Overlay onMouseDown={handleOutside}>
      <ModalBox ref={ref} onMouseDown={(e) => e.stopPropagation()}>
        <Header>
          <TitleModal>{title}</TitleModal>
          <CloseBtn onClick={onClose} aria-label="Fechar">✕</CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FieldLabel>
            <LabelText>Nome</LabelText>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus={!readOnly} disabled={readOnly} />
          </FieldLabel>

          <FieldLabel>
            <LabelText>CPF</LabelText>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          <FieldLabel>
            <LabelText>Telefone</LabelText>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} disabled={readOnly} />
          </FieldLabel>

          {errorMsg && <div style={{ color: '#c0392b', textAlign: 'center', marginBottom: '0.5rem' }}>{errorMsg}</div>}

          <Actions>
            
            <Secondary type="button" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Secondary>

            {mode !== 'view' && (
              <Primary type="submit">
                {mode === 'delete' ? 'Confirmar exclusão' : (mode === 'edit' ? 'Salvar alterações' : 'Salvar')}
              </Primary>
            )}
          </Actions>
        </Form>
      </ModalBox>
    </Overlay>
  );
}

export default PacienteModal;
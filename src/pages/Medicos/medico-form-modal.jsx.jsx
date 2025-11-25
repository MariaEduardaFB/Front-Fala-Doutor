// ...existing code...
import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Actions,
  Primary, Secondary, TitleModal, FieldLabel, LabelText
} from './style.js'


function MedicoModal({ mode = 'create', medico = null, isOpen, onClose, onSave, onDelete }) {
  const ref = useRef(null);
  const [nome, setNome] = useState('');
  const [crm, setCrm] = useState('');
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
      setNome(''); setCrm(''); setTelefone(''); setErrorMsg('');
    } else if (medico) {
      setNome(medico.nome || '');
      setCrm(medico.crm || '');
      setTelefone(medico.telefone || '');
      setErrorMsg('');
    }
  }, [isOpen, mode, medico]);

  if (!isOpen) return null;

  function handleOutside(e) {
    if (ref.current && !ref.current.contains(e.target)) onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'delete') {
      try {
        if (onDelete) await onDelete(medico);
        onClose?.();
      } catch (err) {
        setErrorMsg(err?.message || 'Erro ao excluir médico.');
      }
      return;
    }


    if (!crm.trim()) { setErrorMsg('CRM é obrigatório.'); return; }

    const payload = {
      ... (medico?.id ? { id: medico.id } : {}),
      nome: nome.trim() || 'Nome não informado',
      crm: crm.trim(),
      telefone: telefone.trim() || null
    };

    try {
      if (onSave) await onSave(payload, mode);
      onClose?.();
    } catch (err) {
      setErrorMsg(err?.message || 'Erro ao salvar médico.');
    }
  }

  const readOnly = mode === 'view' || mode === 'delete';
  const title = mode === 'create' ? 'Cadastrar Médico' : mode === 'edit' ? 'Editar Médico' : mode === 'view' ? 'Visualizar Médico' : 'Excluir Médico';

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
            <LabelText>CRM</LabelText>
            <Input value={crm} onChange={(e) => setCrm(e.target.value)} disabled={readOnly} />
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

export default MedicoModal;

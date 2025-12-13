import React, { useEffect, useRef, useState } from 'react';
import {
  Overlay, ModalBox, Header, CloseBtn, Form, Input, Actions,
  Primary, Secondary, TitleModal, FieldLabel, LabelText,
  PlanoInfo, PlanoBadge, PlanoBtn
} from './style.js'
import api from '../../services/api.js'


function PacienteModal({ mode = 'create', paciente = null, isOpen, onClose, onSave, onDelete, onRefresh }) {
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

  const getPlanoStatus = () => {
    const plano = paciente?.plano_saude || paciente?.PlanoSaude;
    if (!plano) return null;
    
    
    if (plano.status) {
      return plano.status === 'ativo';
    }
    
    
    const validade = new Date(plano.validade);
    validade.setHours(23, 59, 59, 999);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return validade >= hoje;
  };

  const planoAtivo = getPlanoStatus();
  const planoData = paciente?.plano_saude || paciente?.PlanoSaude;

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

          {mode === 'view' && (
            <PlanoInfo>
              {planoData ? (
                <>
                  <PlanoBadge $ativo={planoAtivo}>
                    {planoAtivo ? 'Ativo' : 'Inativo'}
                  </PlanoBadge>
                  {!planoAtivo && (
                    <div style={{ 
                      color: '#dc3545', 
                      fontSize: '0.85rem', 
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#ffe6e6',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}>
                      Plano vencido. Não é possível agendar consultas com plano inativo.
                    </div>
                  )}
                  {!editandoPlano ? (
                    <>
                      <div style={{ fontSize: '0.9rem', color: '#333', marginTop: '0.5rem' }}>
                        <div><strong>Plano:</strong> {planoData.nome}</div>
                        <div><strong>Operadora:</strong> {planoData.operadora}</div>
                        <div><strong>Validade:</strong> {new Date(planoData.validade).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <Primary type="button" onClick={() => {
                          setEditandoPlano(true);
                          setPlanoNome(planoData.nome);
                          setPlanoOperadora(planoData.operadora);
                          setPlanoValidade(new Date(planoData.validade).toISOString().split('T')[0]);
                        }}>
                          Editar Plano
                        </Primary>
                        <Secondary type="button" onClick={async () => {
                          if (confirm('Deseja realmente remover o plano de saúde?')) {
                            try {
                              await api.put(`/pacientes/${paciente.id}`, {
                                ...paciente,
                                plano_id: null
                              });
                              if (onRefresh) await onRefresh();
                              onClose?.();
                            } catch (err) {
                              setErrorMsg(err?.response?.data?.message || 'Erro ao remover plano');
                            }
                          }
                        }}>
                          Remover Plano
                        </Secondary>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: '0.5rem' }}>
                      <FieldLabel>
                        <LabelText>Nome do Plano</LabelText>
                        <Input 
                          value={planoNome} 
                          onChange={(e) => setPlanoNome(e.target.value)}
                        />
                      </FieldLabel>
                      <FieldLabel>
                        <LabelText>Operadora</LabelText>
                        <Input 
                          value={planoOperadora} 
                          onChange={(e) => setPlanoOperadora(e.target.value)}
                        />
                      </FieldLabel>
                      <FieldLabel>
                        <LabelText>Validade</LabelText>
                        <Input 
                          type="date"
                          value={planoValidade} 
                          onChange={(e) => setPlanoValidade(e.target.value)}
                        />
                      </FieldLabel>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Primary type="button" onClick={async () => {
                          if (!planoNome.trim() || !planoOperadora.trim() || !planoValidade) {
                            setErrorMsg('Preencha todos os campos do plano');
                            return;
                          }
                          try {
                            await api.put(`/plano_saude/${planoData.id}`, {
                              nome: planoNome.trim(),
                              operadora: planoOperadora.trim(),
                              validade: planoValidade
                            });
                            setEditandoPlano(false);
                            if (onRefresh) await onRefresh();
                            onClose?.();
                          } catch (err) {
                            setErrorMsg(err?.response?.data?.message || 'Erro ao atualizar plano');
                          }
                        }}>
                          Salvar Alterações
                        </Primary>
                        <Secondary type="button" onClick={() => setEditandoPlano(false)}>
                          Cancelar
                        </Secondary>
                      </div>
                    </div>
                  )}
                </>
              ) : !mostrarFormPlano ? (
                <PlanoBtn type="button" onClick={() => setMostrarFormPlano(true)}>
                  Cadastrar Plano
                </PlanoBtn>
              ) : (
                <div style={{ marginTop: '0.5rem' }}>
                  <FieldLabel>
                    <LabelText>Nome do Plano</LabelText>
                    <Input 
                      value={planoNome} 
                      onChange={(e) => setPlanoNome(e.target.value)}
                      placeholder="Ex: Plano Saúde Total"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <LabelText>Operadora</LabelText>
                    <Input 
                      value={planoOperadora} 
                      onChange={(e) => setPlanoOperadora(e.target.value)}
                      placeholder="Ex: Unimed"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <LabelText>Validade</LabelText>
                    <Input 
                      type="date"
                      value={planoValidade} 
                      onChange={(e) => setPlanoValidade(e.target.value)}
                    />
                  </FieldLabel>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Primary type="button" onClick={async () => {
                      if (!planoNome.trim() || !planoOperadora.trim() || !planoValidade) {
                        setErrorMsg('Preencha todos os campos do plano');
                        return;
                      }
                      try {
                        console.log('Cadastrando plano:', { nome: planoNome.trim(), operadora: planoOperadora.trim(), validade: planoValidade });
                        const planoRes = await api.post('/plano_saude', {
                          nome: planoNome.trim(),
                          operadora: planoOperadora.trim(),
                          validade: planoValidade
                        });
                        console.log('Plano criado:', planoRes.data);
                        
                        console.log('Vinculando plano ao paciente:', paciente.id);
                        await api.put(`/pacientes/${paciente.id}`, {
                          ...paciente,
                          plano_id: planoRes.data.id
                        });
                        console.log('Plano vinculado com sucesso');
                        
                        setMostrarFormPlano(false);
                        if (onRefresh) await onRefresh();
                        onClose?.();
                      } catch (err) {
                        console.error('Erro ao cadastrar plano:', err, err?.response?.data);
                        setErrorMsg(err?.response?.data?.message || err.message || 'Erro ao cadastrar plano');
                      }
                    }}>
                      Salvar Plano
                    </Primary>
                    <Secondary type="button" onClick={() => setMostrarFormPlano(false)}>
                      Cancelar
                    </Secondary>
                  </div>
                </div>
              )}
            </PlanoInfo>
          )}

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
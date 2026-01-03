import React, { useState, useEffect } from 'react';
import {
  Overlay,
  ModalLarge,
  Header,
  TitleModal,
  CloseBtn,
  Select,
  Table,
  ChartContainer,
  DateInput,
  Primary,
  FilterGroupModal,
  Label,
  SelectAuto,
  ExportButton,
  ReportTitle,
  ChartTitle,
  EmptyMessage
} from './style.js';
import { FaTimes } from 'react-icons/fa';
import api from '../../services/api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RelatorioModal({ isOpen, onClose }) {
  const [tipoVisualizacao, setTipoVisualizacao] = useState('sintetico');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);

  async function buscarDadosComDatas(inicio, fim) {
    console.log('Buscando dados com:', { dataInicial: inicio, dataFinal: fim });
    setLoading(true);
    try {
      const res = await api.get('/relatorios/busca_agendamentos', {
        params: { dataInicial: inicio, dataFinal: fim }
      });
      console.log('Dados recebidos:', res.data);
      setDados(res.data);
    } catch (err) {
      console.error('Erro ao buscar relatório:', err);
      console.error('Detalhes do erro:', err.response?.data);
      alert('Erro ao buscar dados do relatório: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function buscarDados() {
    if (!dataInicial || !dataFinal) {
      alert('Informe a data inicial e final');
      return;
    }
    await buscarDadosComDatas(dataInicial, dataFinal);
  }

  useEffect(() => {
    if (isOpen) {
      const hoje = new Date();
      const inicioAno = new Date(hoje.getFullYear(), 0, 1);
      const dataInicialStr = inicioAno.toISOString().slice(0, 10);
      const dataFinalStr = hoje.toISOString().slice(0, 10);
      setDataInicial(dataInicialStr);
      setDataFinal(dataFinalStr);
      
      setTimeout(() => {
        if (dataInicialStr && dataFinalStr) {
          buscarDadosComDatas(dataInicialStr, dataFinalStr);
        }
      }, 100);
    } else {
      setDados([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAgendamentos = dados.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);

  function handleExportar() {
    if (dados.length === 0) {
      alert('Nenhum dado para exportar');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (tipoVisualizacao === 'sintetico') {
      csvContent += "Data,Quantidade\n";
      dados.forEach(row => {
        const data = row.dia || row.data_hora;
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
        csvContent += `${dataFormatada},${row.quantidade}\n`;
      });
    } else {
      csvContent += "Período,Quantidade\n";
      dados.forEach(row => {
        const periodo = row.dia || row.data_hora || row.periodo;
        const periodoFormatado = new Date(periodo).toLocaleDateString('pt-BR');
        csvContent += `${periodoFormatado},${row.quantidade}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_agendamentos_${dataInicial}_${dataFinal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Overlay onClick={onClose}>
      <ModalLarge onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleModal>Relatórios</TitleModal>
          <CloseBtn onClick={onClose}>
            <FaTimes />
          </CloseBtn>
        </Header>

        <FilterGroupModal>
          <Label>
            Tipo de visualização:
            <SelectAuto
              value={tipoVisualizacao}
              onChange={(e) => setTipoVisualizacao(e.target.value)}
            >
              <option value="sintetico">Sintético</option>
              <option value="analitico">Analítico</option>
            </SelectAuto>
          </Label>

          <Label>
            Data Inicial:
            <DateInput
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </Label>

          <Label>
            Data Final:
            <DateInput
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </Label>

          <Primary onClick={buscarDados} disabled={loading}>
            {loading ? 'Carregando...' : 'Buscar'}
          </Primary>

          {dados.length > 0 && (
            <ExportButton onClick={handleExportar}>
              Exportar
            </ExportButton>
          )}
        </FilterGroupModal>

        {tipoVisualizacao === 'sintetico' && (
          <div>
            <ReportTitle>
              Visualização Sintética - Total: {totalAgendamentos} agendamentos
            </ReportTitle>
            {dados.length === 0 ? (
              <EmptyMessage>
                Nenhum dado encontrado. Selecione as datas e clique em Buscar.
              </EmptyMessage>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item, index) => {
                    const data = item.dia || item.data_hora;
                    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
                    return (
                      <tr key={index}>
                        <td>{dataFormatada}</td>
                        <td>{item.quantidade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        )}

        {tipoVisualizacao === 'analitico' && (
          <div>
            <ReportTitle>
              Visualização Analítica - Total: {totalAgendamentos} agendamentos
            </ReportTitle>
            {dados.length === 0 ? (
              <EmptyMessage>
                Nenhum dado encontrado. Selecione as datas e clique em Buscar.
              </EmptyMessage>
            ) : (
              <>
                <ChartContainer>
                  <ChartTitle>
                    Gráfico de Barras - Agendamentos por Período
                  </ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dados.map(d => ({ ...d, diaFormatado: new Date(d.dia || d.data_hora).toLocaleDateString('pt-BR') }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="diaFormatado" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantidade" fill="#020054" name="Agendamentos" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </>
            )}
          </div>
        )}
      </ModalLarge>
    </Overlay>
  );
}

export default RelatorioModal;

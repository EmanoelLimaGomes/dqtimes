import { useState } from 'react'
import Layout from '../Componentes/Layout'
import './HistoricoPage.css'

function HistoricoPage() {
  const [busca, setBusca] = useState('')
  
  // Dados de exemplo - apenas 4 colunas: Referência, Tarefa, Série e Previsão
  const [historico] = useState([
    {
      id: 1,
      referencia: 'REF-2024-010',
      tarefa: 'Previsão de Temperatura - Próximas 24 horas',
      serie: 'Temperatura_Horaria_SP_2024',
      previsao: 'Variação: 19°C (madrugada) a 28°C (tarde)'
    },
    {
      id: 2,
      referencia: 'REF-2024-009',
      tarefa: 'Previsão de Consumo de Energia - Diária',
      serie: 'Consumo_Energia_Diario_2024',
      previsao: '350 kWh/dia (sazonalidade detectada)'
    },
    {
      id: 3,
      referencia: 'REF-2024-008',
      tarefa: 'Previsão de Vazão de Dados - Horária',
      serie: 'Vazao_Dados_Horaria_2024',
      previsao: 'Pico: 14:00h - 16:00h (2.3 TB/hora)'
    }
  ])

  // Filtrar dados baseado na busca
  const historicoFiltrado = historico.filter(item => {
    const buscaLower = busca.toLowerCase()
    return (
      item.referencia.toLowerCase().includes(buscaLower) ||
      item.tarefa.toLowerCase().includes(buscaLower) ||
      item.serie.toLowerCase().includes(buscaLower) ||
      item.previsao.toLowerCase().includes(buscaLower)
    )
  })

  return (
    <Layout>
      <div className="historico-page">
        <div className="historico-container">
          <h2>Histórico de Previsões</h2>
          
          <div className="busca-container">
            <input
              type="text"
              className="busca-input"
              placeholder="Buscar por referência, tarefa, série ou previsão..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="tabela-wrapper">
            <table className="tabela-historico">
              <thead>
                <tr>
                  <th>REFERÊNCIA</th>
                  <th>TAREFA</th>
                  <th>SÉRIE</th>
                  <th>PREVISÃO</th>
                </tr>
              </thead>
              <tbody>
                {historicoFiltrado.map((item) => (
                  <tr key={item.id}>
                    <td>{item.referencia}</td>
                    <td>{item.tarefa}</td>
                    <td>{item.serie}</td>
                    <td>{item.previsao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default HistoricoPage

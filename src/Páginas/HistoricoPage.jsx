import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../Componentes/Layout'
import { buscarHistorico } from '../Serviços/historicoService'
import { estaAutenticado } from '../Serviços/loginService'
import './HistoricoPage.css'

function HistoricoPage() {
  const [busca, setBusca] = useState('')
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica autenticação
    if (!estaAutenticado()) {
      navigate('/login')
      return
    }

    // Busca o histórico da API
    const carregarHistorico = async () => {
      try {
        setCarregando(true)
        setErro('')
        const resposta = await buscarHistorico({ details: true, limit: 100 })
        
        // A API retorna: { total_items, page, limit, total_pages, items, links }
        // Cada item tem: referencia, task, status, created_at, finished_at, details (opcional)
        
        // Mapeia os dados da API para o formato esperado pela tabela
        const historicoFormatado = resposta.items.map((item, index) => {
          // Extrai informações dos detalhes se disponível
          let serie = 'N/A'
          let previsao = 'N/A'
          
          if (item.details) {
            // Formata a previsão baseado no tipo de task e details disponíveis
            if (item.details.projecao && Array.isArray(item.details.projecao)) {
              previsao = `Projeção: ${item.details.projecao.slice(0, 5).join(', ')}${item.details.projecao.length > 5 ? '...' : ''}`
            } else if (item.details.medias && Array.isArray(item.details.medias)) {
              previsao = `Médias: ${item.details.medias.slice(0, 5).join(', ')}${item.details.medias.length > 5 ? '...' : ''}`
            } else if (item.details.probabilidade_subir !== undefined) {
              previsao = `Probabilidade: ${(item.details.probabilidade_subir * 100).toFixed(2)}%`
            } else {
              previsao = JSON.stringify(item.details).substring(0, 50) + '...'
            }
            
            // Tenta extrair série dos detalhes ou usa a task como série
            serie = item.details.serie || item.details.serie_temporal || item.details.nome_serie || item.task
          } else {
            // Se não houver details, usa informações básicas
            serie = item.task
            previsao = `Status: ${item.status}`
          }
          
          return {
            id: index + 1,
            referencia: item.referencia,
            tarefa: item.task,
            serie: serie,
            previsao: previsao
          }
        })
        
        setHistorico(historicoFormatado)
      } catch (error) {
        setErro(error.message)
        console.error('Erro ao carregar histórico:', error)
      } finally {
        setCarregando(false)
      }
    }

    carregarHistorico()
  }, [navigate])

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

          {carregando ? (
            <div className="loading-container">
              <p>Carregando histórico...</p>
            </div>
          ) : erro ? (
            <div className="erro-container">
              <p className="erro-texto">⚠️ {erro}</p>
            </div>
          ) : historicoFiltrado.length === 0 ? (
            <div className="vazio-container">
              <p>Nenhum histórico encontrado.</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </Layout>
  )
}

export default HistoricoPage

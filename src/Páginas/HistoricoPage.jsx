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
  const [modalAberto, setModalAberto] = useState(false)
  const [detalhesSelecionados, setDetalhesSelecionados] = useState(null)
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
        const historicoFormatado = resposta.items.map((item) => {
          // Formata as datas
          const formatarData = (dataStr) => {
            if (!dataStr) return 'N/A'
            try {
              const data = new Date(dataStr)
              return data.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            } catch {
              return dataStr
            }
          }

          // Formata os details
          let detailsFormatado = 'N/A'
          if (item.details) {
            try {
              detailsFormatado = JSON.stringify(item.details, null, 2)
            } catch {
              detailsFormatado = String(item.details)
            }
          }
          
          return {
            id: item.id || 'N/A',
            referencia: item.referencia || 'N/A',
            task: item.task || 'N/A',
            status: item.status || 'N/A',
            created_at: formatarData(item.created_at),
            finished_at: formatarData(item.finished_at),
            details: detailsFormatado
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
      String(item.id).toLowerCase().includes(buscaLower) ||
      String(item.referencia).toLowerCase().includes(buscaLower) ||
      String(item.task).toLowerCase().includes(buscaLower) ||
      String(item.status).toLowerCase().includes(buscaLower) ||
      String(item.created_at).toLowerCase().includes(buscaLower) ||
      String(item.finished_at).toLowerCase().includes(buscaLower) ||
      String(item.details).toLowerCase().includes(buscaLower)
    )
  })

  // Funções para o modal
  const abrirModal = (item) => {
    setDetalhesSelecionados(item)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setDetalhesSelecionados(null)
  }

  const copiarParaClipboard = () => {
    if (detalhesSelecionados?.details) {
      navigator.clipboard.writeText(detalhesSelecionados.details)
      alert('Details copiados para a área de transferência!')
    }
  }

  return (
    <Layout>
      <div className="historico-page">
        <div className="historico-container">
          <h2>Histórico de Previsões</h2>
          
          <div className="busca-container">
            <input
              type="text"
              className="busca-input"
              placeholder="Buscar por ID, referência, task, status, datas ou details..."
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
                    <th>ID</th>
                    <th>REFERÊNCIA</th>
                    <th>TASK</th>
                    <th>STATUS</th>
                    <th>CREATED_AT</th>
                    <th>FINISHED_AT</th>
                    <th>DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoFiltrado.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.referencia}</td>
                      <td>{item.task}</td>
                      <td>
                        <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.created_at}</td>
                      <td>{item.finished_at}</td>
                      <td className="details-cell">
                        {item.details !== 'N/A' ? (
                          <button 
                            className="btn-ver-details"
                            onClick={() => abrirModal(item)}
                          >
                            Ver Details
                          </button>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Details */}
      {modalAberto && detalhesSelecionados && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Registro #{detalhesSelecionados.id}</h3>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{detalhesSelecionados.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Referência:</span>
                  <span className="info-value">{detalhesSelecionados.referencia}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Task:</span>
                  <span className="info-value">{detalhesSelecionados.task}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-badge status-${detalhesSelecionados.status?.toLowerCase()}`}>
                    {detalhesSelecionados.status}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created At:</span>
                  <span className="info-value">{detalhesSelecionados.created_at}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Finished At:</span>
                  <span className="info-value">{detalhesSelecionados.finished_at}</span>
                </div>
              </div>
              <div className="details-section">
                <div className="details-header">
                  <h4>Details (JSON)</h4>
                  <button className="btn-copiar" onClick={copiarParaClipboard}>
                    📋 Copiar
                  </button>
                </div>
                <pre className="details-json">{detalhesSelecionados.details}</pre>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-fechar" onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default HistoricoPage

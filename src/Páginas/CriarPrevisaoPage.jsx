import { useState } from 'react'
import Layout from '../Componentes/Layout'
import './CriarPrevisaoPage.css'

function CriarPrevisaoPage() {
  const [nomeReferencia, setNomeReferencia] = useState('')
  const [periodos, setPeriodos] = useState('')
  const [erros, setErros] = useState({})
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const validarFormulario = () => {
    const novosErros = {}

    // Validação do nome de referência
    if (!nomeReferencia.trim()) {
      novosErros.nomeReferencia = 'Nome de referência é obrigatório'
    } else if (nomeReferencia.trim().length < 3) {
      novosErros.nomeReferencia = 'Nome de referência deve ter pelo menos 3 caracteres'
    } else if (nomeReferencia.trim().length > 100) {
      novosErros.nomeReferencia = 'Nome de referência deve ter no máximo 100 caracteres'
    }

    // Validação dos períodos
    if (!periodos.trim()) {
      novosErros.periodos = 'Períodos de previsão é obrigatório'
    } else {
      const numPeriodos = parseInt(periodos)
      if (isNaN(numPeriodos)) {
        novosErros.periodos = 'Períodos deve ser um número válido'
      } else if (numPeriodos < 1) {
        novosErros.periodos = 'Períodos deve ser no mínimo 1'
      } else if (numPeriodos > 365) {
        novosErros.periodos = 'Períodos deve ser no máximo 365'
      }
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Limpa mensagens anteriores
    setMensagem('')
    setTipoMensagem('')
    setErros({})

    // Valida o formulário
    if (!validarFormulario()) {
      return
    }

    // Aqui você pode fazer a requisição para a API
    setMensagem('✅ Formulário válido! Previsão criada com sucesso.')
    setTipoMensagem('sucesso')
    
    // Limpar formulário após sucesso
    setTimeout(() => {
      setNomeReferencia('')
      setPeriodos('')
      setMensagem('')
    }, 3000)
  }

  return (
    <Layout>
      <div className="criar-previsao-page">
        <div className="criar-previsao-container">
          <h2>Criar Nova Previsão</h2>
          
          <form onSubmit={handleSubmit} className="form-previsao">
            <div className="form-group">
              <label htmlFor="nomeReferencia">
                Nome de Referência <span className="obrigatorio">*</span>
              </label>
              <input
                type="text"
                id="nomeReferencia"
                placeholder="Digite o nome de referência"
                value={nomeReferencia}
                onChange={(e) => {
                  setNomeReferencia(e.target.value)
                  if (erros.nomeReferencia) {
                    setErros({ ...erros, nomeReferencia: '' })
                  }
                }}
                className={erros.nomeReferencia ? 'erro' : ''}
              />
              {erros.nomeReferencia && (
                <span className="erro-mensagem">{erros.nomeReferencia}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="periodos">
                Períodos de Previsão <span className="obrigatorio">*</span>
              </label>
              <input
                type="number"
                id="periodos"
                placeholder="Digite o número de períodos (1-365)"
                value={periodos}
                onChange={(e) => {
                  setPeriodos(e.target.value)
                  if (erros.periodos) {
                    setErros({ ...erros, periodos: '' })
                  }
                }}
                min="1"
                max="365"
                className={erros.periodos ? 'erro' : ''}
              />
              {erros.periodos && (
                <span className="erro-mensagem">{erros.periodos}</span>
              )}
              <small className="hint">Mínimo: 1 período | Máximo: 365 períodos</small>
            </div>

            <button type="submit" className="btn-submit">
              Criar Previsão
            </button>
          </form>

          {mensagem && (
            <div className={`mensagem ${tipoMensagem}`}>
              {mensagem}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default CriarPrevisaoPage


/**
 * Serviço de histórico de previsões
 * Gerencia as requisições de histórico com a API
 */

import { API_URL } from '../config/apiConfig'

/**
 * Busca o token de autenticação do localStorage
 * @returns {string|null} Token de autenticação
 */
const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Busca o histórico de previsões
 * @param {Object} filtros - Filtros opcionais (page, limit, status, task, referencia)
 * @returns {Promise<Object>} Resposta com items, paginação e links
 */
export const buscarHistorico = async (filtros = {}) => {
  try {
    const token = getToken()
    
    if (!token) {
      throw new Error('Usuário não autenticado')
    }

    // Constrói a query string com os filtros
    const params = new URLSearchParams()
    if (filtros.page) params.append('page', filtros.page)
    if (filtros.limit) params.append('limit', filtros.limit)
    if (filtros.status) params.append('status', filtros.status)
    if (filtros.task) params.append('task', filtros.task)
    if (filtros.referencia) params.append('referencia', filtros.referencia)
    if (filtros.details !== undefined) params.append('details', filtros.details)

    const queryString = params.toString()
    const url = `${API_URL}/api/history${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      const data = await response.json().catch(() => ({}))
      throw new Error(data.detail || `Erro ao buscar histórico: ${response.status}`)
    }

    const data = await response.json()
    
    // A API retorna: { total_items, page, limit, total_pages, items, links }
    return data
  } catch (error) {
    // Se for erro de conexão
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('Erro de conexão. O servidor está rodando?')
    }
    // Outros erros
    throw error
  }
}


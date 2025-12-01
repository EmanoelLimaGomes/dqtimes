/**
 * Serviço de autenticação
 * Gerencia as requisições de login com a API
 */

import { API_URL } from '../config/apiConfig'

/**
 * Realiza o login do usuário
 * @param {string} username - Nome de usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resposta da API com token e mensagem
 */
export const fazerLogin = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'Erro desconhecido')
    }

    return {
      success: true,
      token: data.token,
      mensagem: data.mensagem,
      usuario: data.usuario,
    }
  } catch (error) {
    // Se for erro de conexão
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      throw new Error('Erro de conexão. O servidor está rodando?')
    }
    // Outros erros
    throw error
  }
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} True se houver token válido
 */
export const estaAutenticado = () => {
  const token = localStorage.getItem('token')
  return !!token
}

/**
 * Remove o token de autenticação
 */
export const fazerLogout = () => {
  localStorage.removeItem('token')
}


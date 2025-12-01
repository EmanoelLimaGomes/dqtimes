/**
 * Configuração da API
 * Centraliza a URL do backend para facilitar mudanças
 */

// URL do backend - ajuste conforme necessário
// Se o backend estiver em outro servidor, altere aqui
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

/**
 * Exemplo de configuração:
 * 
 * Para desenvolvimento local:
 * API_URL = 'http://127.0.0.1:8000'
 * 
 * Para produção ou outro servidor:
 * API_URL = 'http://seu-servidor.com:8000'
 * 
 * Ou use variável de ambiente:
 * Crie um arquivo .env na raiz do projeto com:
 * VITE_API_URL=http://seu-servidor.com:8000
 */


import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { estaAutenticado } from './Serviços/loginService'
import Layout from './Componentes/Layout'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se há token no localStorage
    if (!estaAutenticado()) {
      // Se não houver token, redireciona para login
      navigate('/login')
    }
  }, [navigate])

  return (
    <Layout>
      <div style={{ padding: '40px' }}>
        <h1>Bem-vindo ao DQTimes</h1>
        <p>Você está autenticado!</p>
      </div>
    </Layout>
  )
}

export default App


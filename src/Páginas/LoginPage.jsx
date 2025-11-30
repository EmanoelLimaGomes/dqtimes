import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fazerLogin, estaAutenticado } from '../Serviços/loginService'
import './LoginPage.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Se já estiver autenticado, redireciona para a página principal
    if (estaAutenticado()) {
      navigate('/')
    }
  }, [navigate])

  // Validação de email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validação do formulário
  const validarFormulario = () => {
    const novosErros = {}

    // Validação de email
    if (!email.trim()) {
      novosErros.email = 'E-mail é obrigatório'
    } else if (!validarEmail(email)) {
      novosErros.email = 'E-mail inválido'
    }

    // Validação de senha
    if (!senha.trim()) {
      novosErros.senha = 'Senha é obrigatória'
    } else if (senha.length < 3) {
      novosErros.senha = 'Senha deve ter pelo menos 3 caracteres'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Limpa mensagens anteriores
    setMensagem('')
    setTipoMensagem('')
    setErros({})

    // Valida o formulário
    if (!validarFormulario()) {
      return
    }

    setCarregando(true)

    try {
      // Para compatibilidade com a API, usa email como username
      const resultado = await fazerLogin(email, senha)

      // Sucesso
      setMensagem(`🎉 ${resultado.mensagem}`)
      setTipoMensagem('sucesso')

      // Salva o token no localStorage
      localStorage.setItem('token', resultado.token)
      console.log('Token salvo:', resultado.token)

      // Redireciona para a página principal após 1.5 segundos
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (error) {
      // Erro
      setMensagem(`⚠️ ${error.message}`)
      setTipoMensagem('erro')
    } finally {
      setCarregando(false)
    }
  }

  const handleEsqueciSenha = (e) => {
    e.preventDefault()
    // TODO: Implementar funcionalidade de recuperação de senha
    alert('Funcionalidade de recuperação de senha em desenvolvimento')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Seja bem vindo!</h2>
        <form id="formLogin" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                // Remove erro quando o usuário começa a digitar
                if (erros.email) {
                  setErros({ ...erros, email: '' })
                }
              }}
              disabled={carregando}
              className={erros.email ? 'erro' : ''}
            />
            {erros.email && <span className="erro-mensagem">{erros.email}</span>}
          </div>
          <div className="input-group">
            <input
              type="password"
              id="senha"
              placeholder="Senha"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value)
                // Remove erro quando o usuário começa a digitar
                if (erros.senha) {
                  setErros({ ...erros, senha: '' })
                }
              }}
              disabled={carregando}
              className={erros.senha ? 'erro' : ''}
            />
            {erros.senha && <span className="erro-mensagem">{erros.senha}</span>}
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <a href="#" className="esqueci-senha" onClick={handleEsqueciSenha}>
          Esqueci minha senha
        </a>
        {mensagem && (
          <div className={`mensagem ${tipoMensagem}`}>
            {mensagem}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage

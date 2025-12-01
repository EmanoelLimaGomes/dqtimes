import { Link, useLocation, useNavigate } from 'react-router-dom'
import { fazerLogout } from '../Serviços/loginService'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    fazerLogout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header-content">
          <svg className="header-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="currentColor"/>
          </svg>
          <h2>DQTimes</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/criar-previsao" 
          className={`sidebar-item ${location.pathname === '/criar-previsao' ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
          </svg>
          <span>Criar Previsão</span>
        </Link>
        <Link 
          to="/historico" 
          className={`sidebar-item ${location.pathname === '/historico' ? 'active' : ''}`}
        >
          <svg className="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
          </svg>
          <span>Histórico</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <svg className="logout-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

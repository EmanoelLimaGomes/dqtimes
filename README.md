# DQTimes - Sistema de Previsão de Séries Temporais

## Como Iniciar o Projeto

### Pré-requisitos
- Node.js instalado
- Python 3.8+ instalado
- npm ou yarn

### 1. Instalar Dependências do Frontend
```bash
npm install
```

### 2. Instalar Dependências do Backend
```bash
cd dqtimes/endpoint_historico_dqtimes
pip install -r requirements.txt
```

### 3. Popular Banco de Dados (Opcional - para ter dados de teste)
```bash
cd dqtimes/endpoint_historico_dqtimes
python POPULAR_BANCO_TESTE_PARA_ENDPOINT.PY
```

### 4. Iniciar o Backend
```bash
cd dqtimes/endpoint_historico_dqtimes
python main.py
```

O backend estará rodando em: **http://127.0.0.1:8000**

### 5. Iniciar o Frontend
Em um novo terminal, na raiz do projeto:
```bash
npm run dev
```

O frontend estará rodando em: **http://localhost:3000**

## Credenciais de Login

- **E-mail:** `admin@gmail.com`
- **Senha:** `123`

## Documentação da API

Após iniciar o backend, acesse:
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

## Funcionalidades

- ✅ Login com validação de e-mail
- ✅ Histórico de previsões com busca e filtros
- ✅ Criar nova previsão
- ✅ Interface responsiva (Desktop, Tablet e Mobile)

## Tecnologias

- **Frontend:** React
- **Backend:** FastAPI (Python)
- **Banco de Dados:** SQLite


"""
Arquivo principal que integra o app principal com o endpoint de histórico e autenticação
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa o app principal
from app.main import app as app_principal
from app.auth import router as auth_router

# Importa o endpoint de histórico
from endpoint_historico_dqtimes.main import app as historico_app

# Cria um novo app FastAPI
app = FastAPI(title="DQTimes API", version="1.0.0")

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas de autenticação
app.include_router(auth_router, tags=["Autenticação"])

# Inclui as rotas do app principal (projeções)
# Copia as rotas do app principal
for route in app_principal.routes:
    app.routes.append(route)

# Inclui as rotas do histórico
for route in historico_app.routes:
    app.routes.append(route)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)


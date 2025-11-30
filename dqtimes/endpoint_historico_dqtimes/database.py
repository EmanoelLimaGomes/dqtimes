# database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Usaremos um banco de dados SQLite para simplicidade
# Substitua pelo URL do seu DB (ex: "postgresql://user:password@host/dbname")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'history.db')}"

# engine: Onde o SQLAlchemy se comunica com o banco de dados
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal: Classe que será usada para criar sessões de banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: A classe base para nossos modelos
Base = declarative_base()

# Função auxiliar para obter a sessão de banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
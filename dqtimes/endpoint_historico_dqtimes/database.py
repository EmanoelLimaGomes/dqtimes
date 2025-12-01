from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Caminho do banco de dados SQLite
DATABASE_URL = "sqlite:///./history.db"

# Cria o engine do SQLAlchemy
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Necessário para SQLite
)

# Cria a classe Base para os modelos
Base = declarative_base()

# Cria a fábrica de sessões
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency para obter uma sessão do banco de dados.
    Usado com FastAPI Depends().
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


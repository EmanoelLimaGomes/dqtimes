# main.py (Atualizado)

from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, Query, HTTPException, Request # Adicionado Request
from sqlalchemy.orm import Session
import math # Para cálculo de total_pages

from .database import engine, Base, get_db
from .models import TaskHistory, HistoryResponse, HistoryItemExpanded, Link

from fastapi import FastAPI

app = FastAPI()

print("Criando tabelas no banco (se não existirem)...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas!")




def format_number_in_dict(data: Any, precision: int = 4) -> Any:
    """ Formata floats dentro de um dicionário para a precisão desejada. """
    if isinstance(data, dict):
        return {k: format_number_in_dict(v, precision) for k, v in data.items()}
    elif isinstance(data, list):
        return [format_number_in_dict(item, precision) for item in data]
    elif isinstance(data, float):
        # Formata o número (opcional: arredondar para padronização)
        return round(data, precision)
    return data

def build_pagination_links(request: Request, total_pages: int, page: int, limit: int) -> List[Link]:
    """ Gera os hiperlinks de navegação (first, prev, self, next, last). """
    
    # Captura a URL base para construir os links
    base_url = str(request.url).split('?')[0]
    
    def generate_url(p: int) -> str:
        # Mantém todos os query params existentes, mas atualiza 'page' e 'limit'
        params = dict(request.query_params)
        params['page'] = str(p)
        params['limit'] = str(limit)
        
        # Constrói a string de query
        query_string = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{base_url}?{query_string}"

    links = [
        Link(rel="self", href=generate_url(page))
    ]

    # Link para a primeira página
    if total_pages > 0:
        links.append(Link(rel="first", href=generate_url(1)))

    # Link para a página anterior
    if page > 1 and page <= total_pages:
        links.append(Link(rel="prev", href=generate_url(page - 1)))

    # Link para a próxima página
    if page < total_pages:
        links.append(Link(rel="next", href=generate_url(page + 1)))

    # Link para a última página
    if total_pages > 0 and page != total_pages:
        links.append(Link(rel="last", href=generate_url(total_pages)))
        
    return links


@app.get(
    "/api/history",
    response_model=HistoryResponse,
    summary="Endpoint de histórico (consultas, filtros, paginação e HATEOAS)",
    tags=["History"]
)
def get_history(
    request: Request, # Necessário para construir os hiperlinks
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    status: Optional[str] = Query(None),
    task: Optional[str] = Query(None),
    referencia: Optional[str] = Query(None),
    details: Optional[bool] = Query(True),
):
    """
    Retorna o histórico de execuções com filtros, paginação, datas padronizadas 
    e links de navegação HATEOAS.
    """
    
    # 1. Aplicar Filtros (Lógica permanece a mesma)
    query = db.query(TaskHistory)
    # ... (lógica de filtragem por status, task, referencia) ...
    
    if status:
        query = query.filter(TaskHistory.status == status.upper())
    
    if task:
        query = query.filter(TaskHistory.task == task.lower())
        
    if referencia:
        query = query.filter(TaskHistory.referencia.like(f"%{referencia}%"))

    # 2. Contar e Calcular Paginação
    total_items = query.count()
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 1
    
    if page > total_pages and total_items > 0:
         raise HTTPException(status_code=404, detail=f"Página {page} não encontrada. O número máximo de páginas é {total_pages}.")
         
    # 3. Aplicar Paginação
    offset = (page - 1) * limit
    items = query.order_by(TaskHistory.created_at.desc()).offset(offset).limit(limit).all()

    # 4. Formatar Resposta, Detalhes e Datas
    include_details = details
    formatted_items: List[HistoryItemExpanded] = []
    
    for item in items:
        # Converte para dicionário, incluindo detalhes se necessário
        data_dict = item.to_dict(include_details=include_details)
        
        # PADRONIZAR DATAS: Converte objetos datetime para string ISO 8601
        data_dict['created_at'] = item.created_at.isoformat() if item.created_at else None
        data_dict['finished_at'] = item.finished_at.isoformat() if item.finished_at else None
        
        # PADRONIZAR NÚMEROS: Formata floats dentro do campo 'details' (se presente)
        if include_details and data_dict.get('details'):
            data_dict['details'] = format_number_in_dict(data_dict['details'])
        
        # Converte o dicionário formatado para o modelo Pydantic
        formatted_items.append(HistoryItemExpanded(**data_dict))

    # 5. INCLUIR HIPERLINKS DE NAVEGAÇÃO
    links = build_pagination_links(request, total_pages, page, limit)

    return HistoryResponse(
        total_items=total_items,
        page=page,
        limit=limit,
        total_pages=total_pages, # Novo campo
        items=formatted_items,
        links=links # Novo campo
    )


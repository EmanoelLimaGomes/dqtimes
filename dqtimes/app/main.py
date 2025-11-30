import os
import io
import asyncio
import json
import dask.dataframe as dd
import pandas as pd
import tempfile
from dask.distributed import Client, LocalCluster
from app import forecast_temp
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import math
import time
import logging

# Iniciar um cluster local e um cliente Dask
cluster = LocalCluster()
client = Client(cluster)

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# configura o loggin - registro de logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# configura o ambiente do fallback
FORCE_FALLBACK = os.getenv("FORCE_FALLBACK", "false").lower() in ("1", "true", "yes")

# metricas simples em memoria - integrar o prometheus depois aui
_metrics = {
    "fallback_count": 0,
    "requests_csv": 0
}


@app.on_event("startup")
async def startup_event():
    logging.info(f"Dask Dashboard is available at {client.dashboard_link}")

# mapeando rotas publicas com roteamento seguro - usando FileResponse do FastAPI

#/
@app.get("/")
async def root():
    return FileResponse("app/templates/index.html", media_type="text/html")

#/app
@app.get("/app")
async def app_page():
    return FileResponse("app/templates/app.html", media_type="text/html")

#/historico
@app.get("/historico")
async def historico():
    return FileResponse("app/templates/historico.html", media_type="text/html")


#/health - checagem de saude health 
@app.get("/health")
async def health():
    return {"status": "ok"}

#/ready - checagem de saude readiness
@app.get("/ready")
async def readiness():
    try:
        # verificando se o dask esta conectado e o scheduler ta responsivo
        info = client.scheduler_info()
        if info:
            return {"status": "ready"}
        else:
            raise HTTPException(status_code=503, detail="Scheduler not responsive")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Not ready: {str(e)}")


#/metrics - metricas simples - substituir por prometheus depois
@app.get("/metrics")
async def metrics():
    """Endpointe de metricas simples (JSON).
    utilizado para checagens rapidas, mas tem que trocar pelo prometheis depois.
    """
    return _metrics


@app.post("/projecao_lista/")
async def upload_file(
    lista_historico: str = Form(...),
    quantidade_projecoes: int = Form(...),
):

    lista_original = json.loads(lista_historico)  # Convertendo para lista

    n = quantidade_projecoes 

    # Chamando a função de previsão
    resultado = forecast_temp(lista_original, n)

    return {
        "projecoes": resultado
    }

@app.post("/projecao_dataframe/")
async def upload_file(
    csv_dataframe: UploadFile = File(...),
    quantidade_projecoes: int = Form(...),
    header: bool = Form(...),
    index_col: bool = Form(...),
    page: int = Query(1, ge=1),  # Número da página, deve ser >= 1
    page_size: int = Query(10, ge=1),  # Tamanho da página, deve ser >= 1
):
    n = quantidade_projecoes

    # Salvar o conteúdo do arquivo em um arquivo temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_file:
        tmp_file.write(await csv_dataframe.read())
        tmp_file_path = tmp_file.name

    #incrementa os requests
    _metrics["requests_csv"] += 1

    lista_df = []
    start_time = time.time()

    # se forcar o fallback pelo ambiente, ele para de tentar a usar o dask e vai para o pandas
    if FORCE_FALLBACK:
        logging.warning("FORCE_FALLBACK ativo: usando fallback pandas para o processamento de csv")
        pdf = pd.read_csv(tmp_file_path, header=0 if header else None)
        if index_col:
            pdf = pdf.drop(pdf.columns[0], axis=1)

        total_rows = len(pdf)
        total_pages = math.ceil(total_rows / page_size)

        if page > total_pages:
            raise HTTPException(status_code=404, detail="numero de pagina fora do range")

        start_index = (page - 1) * page_size
        end_index = start_index + page_size

        pdf_slice = pdf.iloc[start_index:end_index]
        for index, row in pdf_slice.iterrows():
            lista_df.append(row.tolist())

        _metrics["fallback_count"] += 1
    else:
        #aqui ele tenta o dask primeiro, mas se falhar manda para o pandas
        try:
            ddf = dd.read_csv(tmp_file_path, header=0 if header else None)
            if index_col:
                ddf = ddf.drop(ddf.columns[0], axis=1)

            total_rows = len(ddf)
            total_pages = math.ceil(total_rows / page_size)

            if page > total_pages:
                raise HTTPException(status_code=404, detail="numero de pagina fora do range")

            start_index = (page - 1) * page_size
            end_index = start_index + page_size

            ddf_paginated = ddf.loc[start_index:end_index]
            for part in ddf_paginated.to_delayed():
                for index, row in part.compute().iterrows():
                    lista_df.append(row.tolist())
        except Exception as e:
            logging.warning(f"processamento em dask falhou, voltando a utilizar pandas: {e}")
            pdf = pd.read_csv(tmp_file_path, header=0 if header else None)
            if index_col:
                pdf = pdf.drop(pdf.columns[0], axis=1)

            total_rows = len(pdf)
            total_pages = math.ceil(total_rows / page_size)

            if page > total_pages:
                raise HTTPException(status_code=404, detail="numero de pagina fora do range")

            start_index = (page - 1) * page_size
            end_index = start_index + page_size

            pdf_slice = pdf.iloc[start_index:end_index]
            for index, row in pdf_slice.iterrows():
                lista_df.append(row.tolist())

            _metrics["fallback_count"] += 1

    # Aplica a função de projeção à lista de listas
    
    resultado = []
    for lista in lista_df:
        projection = forecast_temp(lista, n)
        resultado.append(projection)

    end_time = time.time()
    execution_time = end_time - start_time 

    return {
        "execution_time": execution_time,
        "total_pages": total_pages,
        "current_page": page,
        "projecoes": resultado
    }

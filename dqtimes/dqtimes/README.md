# dqtimes stack

Envio de séries temporais para previsão via FastAPI com suporte a Dask, Celery, Redis e monitoramento Flower.

## Pré-requisitos
- Docker + Docker Compose (v2)
- Porta 8000 livre para o backend e 5555 livre para o Flower

## Serviços
| Serviço  | Descrição                          | Porta host |
|----------|------------------------------------|------------|
| backend  | FastAPI + Dask (`uvicorn`)         | 8000       |
| celery   | Worker Celery lendo do Redis       | -          |
| redis    | Broker e backend das tarefas       | 6379       |
| flower   | Painel web das tarefas Celery      | 5555       |

## Executando

1. Configure as variáveis de ambiente no arquivo `.env` (já contém valores padrão):
   ```env
   REDIS_URL=redis://redis:6379/0
   FLOWER_PORT=5555
   FLOWER_BASIC_AUTH=admin:admin  # ⚠️ Altere em produção!
   ```

2. Construa e suba todo o stack:

```powershell
docker compose up --build
```

3. Acesse os serviços:
   - **Backend API**: `http://localhost:8000/docs`
   - **Flower Dashboard**: `http://localhost:5555` (credenciais: `admin / admin`)
   - Dashboard do Dask aparece no log de inicialização do backend

## Flower - Monitoramento Celery

### ✅ Configuração implementada:
- **Container Flower**: rodando no stack backend via `docker-compose.yml`
- **Conexão Redis**: conectado ao broker configurado via `${REDIS_URL}` no `.env`
- **Workers Celery**: monitorando worker `celery@<hostname>` em tempo real
- **URL de acesso**: `http://localhost:${FLOWER_PORT}` (padrão: 5555)
- **Credenciais**: definidas em `FLOWER_BASIC_AUTH` no `.env` (padrão: `admin:admin`)
- **⚠️ Segurança**: Sempre altere `FLOWER_BASIC_AUTH` antes de deploy em produção e adicione `.env` ao `.gitignore`

### Funcionalidades disponíveis no painel:
- **Tasks**: visualizar tarefas registradas (incluindo `app.celery.test_task`)
- **Workers**: status dos workers ativos, concorrência, uptime
- **Monitor**: gráficos em tempo real de execução de tarefas
- **Broker**: estatísticas do Redis

### Testar tarefas:
Execute dentro do container backend para disparar uma tarefa de teste:
```bash
docker exec -it backend python -c "from app.celery import test_task; test_task.delay()"
```
A tarefa aparecerá imediatamente no dashboard Flower.

## Troubleshooting
- **Flower não sobe**: confirme se a porta 5555 está livre e se o container tem acesso ao Redis (`docker compose logs flower`).
- **Tarefas não aparecem**: verifique se os workers Celery estão rodando (`docker compose logs celery`) e se o backend está publicando tarefas.
- **Outras dependências nativas**: as bibliotecas `.so` já estão incluídas; execute sempre dentro do container Linux para evitar erros de carregamento no Windows.

## Desenvolvimento local (opcional)
Se preferir rodar sem Docker, crie um virtualenv, instale `requirements.txt`, configure o Redis localmente e exporte as mesmas variáveis do `.env`. Lembre-se de que as bibliotecas `.so` requerem ambiente Linux/WSL.
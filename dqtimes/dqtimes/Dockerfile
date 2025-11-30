FROM python:3.11-slim

WORKDIR /app

# Dependências do sistema
RUN apt update && \
    apt install -y build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copia antes o requirements para aproveitar cache
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8000"]

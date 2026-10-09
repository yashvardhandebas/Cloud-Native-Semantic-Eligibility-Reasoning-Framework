FROM python:3.12-slim

WORKDIR /app

COPY . /app/gateway
COPY layer1-ingestion /app/layer1-ingestion
COPY layer2-semantic-extraction /app/layer2-semantic-extraction
COPY layer3-reasoning-engine /app/layer3-reasoning-engine
COPY layer4-delivery/layer4-service /app/layer4-delivery/layer4-service

RUN pip install --no-cache-dir fastapi uvicorn requests pydantic scikit-learn groq python-dotenv

EXPOSE 8000
CMD ["uvicorn", "gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Afropedia Production Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc curl wget \
    && rm -rf /var/lib/apt/lists/*

# Install MeiliSearch
RUN curl -L https://install.meilisearch.com | sh

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN useradd --create-home --shell /bin/bash afropedia
RUN chown -R afropedia:afropedia /app
USER afropedia

# Expose ports (8000 for FastAPI, 7700 for MeiliSearch)
EXPOSE 8000 7700

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Create startup script
RUN echo '#!/bin/bash\n\
# Start MeiliSearch in background\n\
./meilisearch --http-addr 0.0.0.0:7700 --master-key masterKey &\n\
\n\
# Wait for MeiliSearch to start and initialize indexes\n\
echo "Waiting for MeiliSearch to start..."\n\
sleep 10\n\
\n\
# Initialize MeiliSearch indexes in background\n\
python init_meilisearch.py &\n\
\n\
# Start FastAPI app\n\
uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Start both services
CMD ["/app/start.sh"]

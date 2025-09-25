# Afropedia Production Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc curl \
    && rm -rf /var/lib/apt/lists/*

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

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check (Railway uses PORT env var)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start application (Railway provides PORT env var)
CMD uvicorn main:app --host 0.0.0.0 --port $PORT

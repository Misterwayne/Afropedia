#!/bin/bash
# Afropedia Production Startup Script
# Generated on 2025-09-14T20:47:21.870015

set -e  # Exit on error

echo "🚀 Starting Afropedia API in production mode..."

# Check environment
if [ "$ENVIRONMENT" != "production" ]; then
    echo "⚠️  Warning: ENVIRONMENT is not set to 'production'"
fi

# Start with SSL if enabled
if [ "$SSL_ENABLED" = "true" ]; then
    echo "🔒 Starting with SSL enabled..."
    exec uvicorn main:app \
        --host 0.0.0.0 \
        --port 8443 \
        --ssl-keyfile="$SSL_KEY_FILE" \
        --ssl-certfile="$SSL_CERT_FILE" \
        --workers 4 \
        --access-log \
        --log-level info
else
    echo "🌐 Starting without SSL..."
    exec uvicorn main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 4 \
        --access-log \
        --log-level info
fi

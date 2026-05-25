# Production runner
FROM python:3.11-slim AS backend-runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app code
COPY backend/app ./app
# Copy static frontend files (pre-built locally) to app/static
COPY mobile/dist ./app/static

# Set environment variables
ENV PORT=7860
EXPOSE 7860

# Command to run Uvicorn
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

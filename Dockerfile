# Stage 1: Build the Expo Web app
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy lock files and configs
COPY mobile/package*.json ./mobile/
COPY mobile/.npmrc ./mobile/

# Install mobile dependencies
WORKDIR /app/mobile
RUN npm install --legacy-peer-deps

# Copy mobile code and build
COPY mobile/ ./
RUN npx expo export -p web

# Stage 2: Production runner
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
# Copy static frontend files to app/static
COPY --from=frontend-builder /app/mobile/dist ./app/static

# Set environment variables
ENV PORT=8080
EXPOSE 8080

# Command to run Uvicorn
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

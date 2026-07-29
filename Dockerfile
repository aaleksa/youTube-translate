# syntax=docker/dockerfile:1
#
# Self-hosted image for YouTube Translator (Translaty).
# Bundles Node.js + yt-dlp so subtitle extraction works with full
# functionality (multi-language captions, video metadata) out of the box.
#
# Usage:
#   cp .env.example .env.local   # add OPENAI_API_KEY and other secrets
#   docker compose up --build
#
# Storage defaults to STORAGE_BACKEND=local (SQLite, persisted via the
# ./data volume in docker-compose.yml). Set STORAGE_BACKEND=dynamodb +
# AWS/Cognito env vars to point at a real AWS backend instead.

# ---- deps: install npm dependencies (needs build tools for the ----
# ---- better-sqlite3 native binding) ---------------------------------
FROM node:20-bookworm-slim AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- builder: compile the Next.js app --------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: minimal production image with yt-dlp --------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# yt-dlp is required for full subtitle-extraction functionality
# (see README "yt-dlp" prerequisite). Installed via pip to match the
# documented Linux install method and stay architecture-independent.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-pip ca-certificates \
  && pip3 install --no-cache-dir --break-system-packages -U yt-dlp \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# SQLite data directory for STORAGE_BACKEND=local (mount as a volume)
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"]

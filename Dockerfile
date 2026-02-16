# ---- Build ----
FROM node:20-bookworm AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine

# Python for the automation bot
RUN apk add --no-cache python3 py3-pip && \
  python3 -m venv /opt/venv && \
  /opt/venv/bin/pip install --upgrade pip

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Next.js standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Bot: code + config seed (Python modules; config.yaml comes from volume or app)
COPY bot ./bot
RUN pip3 install --no-cache-dir -r bot/requirements.txt
RUN mkdir -p /app/bot/config_seed && \
  cp /app/bot/config/__init__.py /app/bot/config/settings.py /app/bot/config_seed/ 2>/dev/null || true

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

EXPOSE 3000

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# All connections stay local: Ollama via OLLAMA_BASE_URL, data in ./bot volumes
ENTRYPOINT ["/docker-entrypoint.sh"]

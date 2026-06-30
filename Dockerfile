# syntax=docker/dockerfile:1

FROM oven/bun:1.2-slim AS deps

WORKDIR /app

# Prisma needs OpenSSL
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy Prisma schema & config before install (postinstall needs them)
COPY package.json bun.lock* ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile

# ── Production image ────────────────────────────────────────────────────

FROM oven/bun:1.2-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Security: non-root user
RUN groupadd -r app && useradd -r -g app app

# Copy deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Generated Prisma client
COPY --from=deps /app/src/generated ./src/generated

# Source code
COPY index.ts ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

USER app
EXPOSE 5005

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/usr/bin/curl", "-sf", "http://localhost:5005/health"]

CMD ["bun", "start"]

# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Imagem de produção da aplicação Next.js (multi-stage build).
#
#   deps    -> instala as dependências (npm ci, com cache do lockfile)
#   builder -> gera o Prisma Client e roda "next build" (output standalone).
#              Também é usado pelo serviço "migrate" do docker-compose, pois
#              contém o Prisma CLI e o tsx (db push + seed).
#   runner  -> imagem final enxuta: só o servidor standalone, sem devDeps,
#              rodando como usuário não-root.
# ---------------------------------------------------------------------------

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
# O engine do Prisma precisa do OpenSSL em runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts exige DATABASE_URL apenas para carregar a configuração;
# "prisma generate" e "next build" não se conectam ao banco, então um valor
# fictício basta aqui. A URL real é injetada em runtime pelo docker-compose.
ARG DATABASE_URL="mongodb://build-placeholder:27017/build"
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma Client gerado (inclui o query engine nativo para Linux).
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/post').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]

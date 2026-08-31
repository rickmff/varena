FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock ./
COPY prisma ./prisma
ENV YARN_CACHE_FOLDER=/cache/yarn
RUN --mount=type=cache,target=/cache/yarn yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_APP_URL=https://www.v-arena.com
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
ENV BETTER_AUTH_SECRET="build-placeholder"
ENV BETTER_AUTH_URL="https://www.v-arena.com"
ENV NEXTAUTH_URL="https://www.v-arena.com"
ENV RESEND_API_KEY="re_placeholder"
ENV GAME_DATABASE_URL="mysql://build:build@localhost:3306/build"
ENV GAME_DATABASE_URL_EU="mysql://build:build@localhost:3306/build"
ENV GAME_DATABASE_URL_NA="mysql://build:build@localhost:3306/build"
ENV GAME_DATABASE_URL_OCE="mysql://build:build@localhost:3306/build"
ENV GAME_DATABASE_URL_BR="mysql://build:build@localhost:3306/build"
ENV GAME_DATABASE_URL_SEA="mysql://build:build@localhost:3306/build"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate && yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
# newest-build label; declared at stage END so it never busts earlier layers
ARG BUILD_DATE
LABEL org.opencontainers.image.created=$BUILD_DATE
EXPOSE 3000
CMD ["node", "server.js"]

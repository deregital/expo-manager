FROM node:20-bullseye AS builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* variables are inlined at build time, so .env is mounted only for this step.
RUN --mount=type=secret,id=env,target=/app/.env npm run build

FROM node:20-bullseye
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
USER node
WORKDIR /home/node
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/next.config.mjs ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
EXPOSE 3000
CMD ["npx", "next", "start"]

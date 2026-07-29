FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json next.config.ts ./
COPY public/ public/
COPY src/ src/
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/.next .next
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.ts .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]

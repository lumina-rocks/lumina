FROM node:18-alpine as builder
WORKDIR /app

COPY lumina/package.json lumina/package-lock.json ./
RUN npm ci
COPY ./lumina/ .
RUN npm run build

FROM node:18-alpine as runner
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN npm i
EXPOSE 3000
CMD ["node", "server.js"]
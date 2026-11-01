FROM oven/bun:1.4-slim AS bun-stage

FROM node:22-bookworm-slim

# Install Chromium, FFmpeg, and required font/media libraries for Remotion
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ffmpeg \
    fonts-noto-color-emoji \
    fonts-freefont-ttf \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=bun-stage /usr/local/bin/bun /usr/local/bin/bun

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV BROWSER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PORT=8080
ENV NODE_ENV=production
ENV LEFTHOOK=0

WORKDIR /app

# Copy repo files and install production dependencies for render-service
COPY . .
RUN bun install --filter render-service --production --ignore-scripts \
    && rm -rf /root/.bun/install/cache /tmp/* \
              /app/node_modules/.bun/next* /app/node_modules/.bun/@next* \
              /app/node_modules/.bun/@prisma* /app/node_modules/.bun/prisma* \
              /app/node_modules/.bun/autumn-js*

EXPOSE 8080

CMD ["bun", "run", "--cwd", "apps/render-service", "src/index.ts"]

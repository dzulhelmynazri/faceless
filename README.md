# faceless

Faceless is a fullstack AI-powered video automation platform built with modern TypeScript, Next.js, Remotion and Cloudflare Containers.

## Features

- **TypeScript** - Strict end-to-end type safety
- **Next.js** - Full-stack React framework (App Router)
- **React Native & Expo** - Cross-platform mobile application
- **Remotion Video Rendering** - Server-side video rendering powered by Cloudflare Containers (Chromium + FFmpeg microVMs)
- **Files SDK + Cloudflare R2** - Unified object storage for video assets, music, and exports
- **Email SDK + Cloudflare** - Transactional email delivery via Cloudflare Email Sending
- **AI Agents & Scriptwriting** - AI generation and automated script evaluation built on the Eve framework and AI SDK
- **Social Publishing** - Automated multi-platform social media distribution via Zernio
- **Billing & Subscriptions** - Usage-based billing and credit management with Autumn
- **tRPC** - End-to-end type-safe API layer across client and server
- **Prisma & PostgreSQL** - Type-safe ORM backed by Neon serverless Postgres
- **Authentication** - Better Auth with Google SSO and email/password support
- **evlog** - Structured wide-event logging with Better Auth context and AI telemetry
- **Turborepo** - Fast, cached monorepo pipeline

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Environment Configuration

Each app and package defines its typed schema in `.env.schema`. Varlock generates type-safe `src/env.ts` accessors automatically via `bun run env:generate`.

1. Copy `.env.example` to `apps/web/.env` and provide your secrets (Database, Cloudflare R2, Better Auth, AI keys, Autumn).
2. Generate typed environment accessors:

```bash
bun run env:generate
```

### 3. Database Setup

Ensure your PostgreSQL connection string is set in `apps/web/.env` (`DATABASE_URL` and `DATABASE_URL_DIRECT`).

```bash
# Push schema changes to your database
bun run db:push

# Generate Prisma Client
bun run db:generate
```

### 4. Run Development Servers

```bash
# Start all apps and services simultaneously
bun run dev

# Or run specific applications:
bun run dev:web     # Next.js web app (http://localhost:3010)
bun run dev:render  # Local Remotion render service (http://localhost:8080)
bun run dev:native  # Expo mobile app
```

Open [http://localhost:3010](http://localhost:3010) to access the web application.

## Remotion Render Service (Cloudflare Containers)

Video rendering runs as a standalone microservice in `apps/render-service`. It runs inside a Firecracker microVM on Cloudflare Containers with Chromium and FFmpeg pre-installed.

### Local Development

Run the render service locally on port 8080:

```bash
bun run dev:render
```

Verify service health:

```bash
curl http://localhost:8080/health
# {"status":"ok","uptime":...}
```

### Cloudflare Deployment

Deploy the container and worker to Cloudflare:

```bash
bun run --cwd apps/render-service deploy
```

#### Required Worker Secrets

The following sensitive credentials must be set on the `render-service` Cloudflare Worker via `wrangler secret put` or the Cloudflare Dashboard:

```bash
bun run --cwd apps/render-service wrangler secret put R2_ACCESS_KEY_ID
bun run --cwd apps/render-service wrangler secret put R2_SECRET_ACCESS_KEY
bun run --cwd apps/render-service wrangler secret put RENDER_SERVICE_TOKEN
bun run --cwd apps/render-service wrangler secret put RENDER_WEBHOOK_SECRET
```

#### Verification

```bash
curl https://render-service.dzulhelmy.workers.dev/health
# {"status":"ok","uptime":...}
```

Point `RENDER_SERVICE_URL` in `apps/web/.env` to `https://render-service.dzulhelmy.workers.dev` to dispatch cloud render jobs.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Design tokens and global CSS live in `packages/ui/src/styles/globals.css`.
- Shared components live in `packages/ui/src/components/*`.
- Component registry configs are defined in `packages/ui/components.json` and `apps/web/components.json`.

### Add shared primitives

Add primitives to the shared UI package:

```bash
npx shadcn@latest add dialog popover sheet table -c packages/ui
```

Import in applications:

```tsx
import { Button } from "@faceless/ui/components/button";
```

## Project Structure

```
faceless/
├── apps/
│   ├── web/             # Fullstack Next.js web application
│   ├── native/          # Mobile application (React Native & Expo)
│   └── render-service/  # Cloudflare Containers Remotion rendering microservice
├── packages/
│   ├── agent/           # AI agents and evals (Eve framework + AI SDK)
│   ├── api/             # tRPC router and backend business logic
│   ├── auth/            # Better Auth server configuration and client adapters
│   ├── config/          # Shared Vitest, TypeScript, and lint configurations
│   ├── contracts/       # Shared types, Zod schemas, and webhook payloads
│   ├── db/              # Prisma schema, migrations, and database client
│   ├── email/           # Transactional email client (Cloudflare Email Sending)
│   ├── remotion/        # Remotion compositions, props schemas, and local/cloud renderers
│   ├── socials/         # Social media publishing client (Zernio integration)
│   ├── storage/         # Cloudflare R2 file storage client (Files SDK)
│   ├── ui/              # Shared shadcn/ui primitives and Tailwind styling
│   └── utils/           # Shared TypeScript helpers and utilities
```

## Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all applications concurrently via Turborepo |
| `bun run dev:web` | Start only the Next.js web application |
| `bun run dev:render` | Start the local Remotion render service |
| `bun run dev:native` | Start the React Native / Expo development server |
| `bun run build` | Build all applications and packages |
| `bun run check-types` | Type check all workspaces (`tsc --noEmit`) |
| `bun run test` | Run unit test suites with Vitest |
| `bun run lint` | Check code standards with Ultracite (Oxlint + Oxfmt) |
| `bun run fix` | Automatically fix linting and formatting issues |
| `bun run env:generate` | Regenerate typed Varlock env accessors |
| `bun run db:push` | Push Prisma schema directly to the PostgreSQL database |
| `bun run db:generate` | Generate Prisma client types |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Launch Prisma Studio UI |
| `bun run autumn:setup` | Run initial setup script for Autumn billing |

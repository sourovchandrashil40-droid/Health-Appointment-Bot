# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This project is **MedBot** — an AI-powered Doctor Appointment Automation chatbot for Bangladesh's healthcare sector.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2 for chat)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (backend)
│   └── medbot/             # MedBot React frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # Server-side OpenAI client
│   └── integrations-openai-ai-react/   # React hooks for OpenAI
├── scripts/                # Utility scripts
│   └── src/seed-doctors.ts # Seeds Bangladesh doctor data
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## MedBot Features

- AI chat assistant powered by GPT-5.2
- Doctor search by city and specialty (44 doctors across 8 Bangladesh cities)
- City support: Dhaka, Chittagong, Barisal, Rajshahi, Sylhet, Khulna, Comilla, Mymensingh
- Specialties: Gastroenterologist, Cardiologist, Neurologist, Gynecologist, Orthopedic, Dermatologist, Pediatrician, Endocrinologist, Ophthalmologist, General Physician, Psychiatrist, Pulmonologist
- Doctor availability slots (next 7 days)
- Appointment booking with confirmation

## Database Schema

- `conversations` — AI chat sessions
- `messages` — Chat message history
- `doctors` — Doctor profiles (seeded with 44 Bangladesh doctors)
- `appointments` — Booked appointments

## API Routes

- `GET /api/healthz` — Health check
- `GET|POST /api/openai/conversations` — Conversation management
- `GET|DELETE /api/openai/conversations/:id` — Single conversation
- `GET|POST /api/openai/conversations/:id/messages` — Messages + SSE streaming
- `GET /api/doctors?city=X&specialty=Y` — Filter doctors
- `GET /api/doctors/:id/availability` — Doctor time slots
- `GET|POST /api/appointments` — Appointment management

## Development

- `pnpm --filter @workspace/api-server run dev` — Run API server
- `pnpm --filter @workspace/medbot run dev` — Run frontend
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API types
- `pnpm --filter @workspace/db run push` — Push DB schema
- `pnpm --filter @workspace/scripts run seed-doctors` — Seed doctor data

# MedBot — Doctor Appointment Assistant

MedBot is a web app prototype that helps people explore doctors by specialty and city, view listed availability, and book an appointment through a chat-based interface. It is designed around healthcare discovery in Bangladesh.

> **Prototype notice:** Doctor profiles and availability are sample data for demonstration. MedBot is not connected to hospital systems, and bookings made in this prototype are not confirmed with a real hospital or doctor. Do not enter real patient or medical information.

## Features

- Conversational assistant for doctor discovery
- Search doctors by specialty and city
- View listed appointment time slots
- Create and view appointment records
- Sample doctor listings across Bangladesh cities

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** OpenAI-compatible integration through Replit AI Integrations
- **API:** REST endpoints described with OpenAPI; generated client and validation types
- **Workspace:** pnpm monorepo

## Requirements

- Node.js 24 or later
- pnpm
- PostgreSQL
- Replit AI Integrations, or a compatible OpenAI endpoint for local development

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   pnpm install
   ```

2. Configure the required environment variables in your development environment:

   ```text
   DATABASE_URL=your_postgresql_connection_string
   AI_INTEGRATIONS_OPENAI_BASE_URL=your_openai_compatible_endpoint
   AI_INTEGRATIONS_OPENAI_API_KEY=your_api_key
   ```

   In Replit, add values using **Secrets** rather than committing them to the repository. Do not commit real credentials or a `.env` file.

3. Create or update the database tables:

   ```bash
   pnpm --filter @workspace/db run push
   ```

4. Add the sample doctor listings:

   ```bash
   pnpm --filter @workspace/scripts run seed-doctors
   ```

5. Start the API server and web app in separate terminals:

   ```bash
   pnpm --filter @workspace/api-server run dev
   ```

   ```bash
   pnpm --filter @workspace/medbot run dev
   ```

The API is served under `/api`. The frontend is served by Vite.

## Useful commands

```bash
pnpm run typecheck
pnpm --filter @workspace/api-spec run codegen
```

## API overview

- `GET /api/healthz` — check API health
- `GET /api/doctors?city=<city>&specialty=<specialty>` — search doctors
- `GET /api/doctors/:id/availability` — view listed time slots
- `GET|POST /api/appointments` — list or create appointments
- `/api/openai/conversations` — manage chat conversations and messages

## Project structure

```text
artifacts/
  api-server/   Express API
  medbot/       React web app
lib/
  api-spec/     OpenAPI specification and code generation
  db/           Drizzle schema and database connection
scripts/        Utility scripts, including sample doctor seeding
```

## Medical and data disclaimer

MedBot is a software demonstration, not a medical service. It does not diagnose conditions or replace advice from a qualified healthcare professional. Confirm doctor details and appointment availability directly with the relevant hospital before relying on them.

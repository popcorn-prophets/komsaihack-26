<p align="center">
 <img src="docs/images/logo.png" alt="Project HERMES logo" width="220" />
</p>

<p align="center">
 <strong>Hazard and Emergency Reporting, Monitoring, and Evaluation System</strong>
</p>

<p align="center">
 A centralized disaster communication control center for faster reporting, clearer coordination, and timely public advisories.
</p>

<p align="center">
 <img src="https://img.shields.io/badge/Next.js-App-111111?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=000000" alt="Next.js badge" />
 <img src="https://img.shields.io/badge/Supabase-Backend-111111?style=for-the-badge&logo=supabase&logoColor=white&labelColor=000000" alt="Supabase badge" />
 <img src="https://img.shields.io/badge/PostgreSQL-Database-111111?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=000000" alt="PostgreSQL badge" />
 <img src="https://img.shields.io/badge/AI_SDK-NLP_Parsing-111111?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="AI SDK badge" />
 <img src="https://img.shields.io/badge/Chat_Integrations-Telegram%20%26%20Messenger-111111?style=for-the-badge&logo=telegram&logoColor=white&labelColor=000000" alt="Chat integrations badge" />
</p>

## Overview

Project HERMES is a disaster communication platform for local DRRM offices.

In simple terms, it helps people report incidents through chat, then helps responders see those reports in one control center.

Residents can send natural, free-form messages (the way they normally chat). HERMES then helps turn those messages into a structured report that responders can review and act on quickly.

## Why This Project Exists

During emergencies, communication is often slow and scattered.

Common problems include:

- People report incidents in different formats, so details are hard to process quickly.
- Important updates are spread across multiple channels.
- Responders need a faster view of what is happening right now.

Project HERMES exists to bring reports and advisories into one place, so response teams can make faster, better decisions.

## Key Features

- Chat-based incident reporting through familiar messaging apps
- AI-assisted parsing of free-form messages into structured incident details
- Real-time incident feed for responders
- Map view to spot incident locations quickly
- Advisory broadcasting for public information updates
- Targeted advisories by location or incident context
- Role-based dashboard access for responder and admin workflows

## How to Use

### For Residents

1. Open the official HERMES bot in your messaging app.
2. Send a message describing what happened.
3. Include key details if possible (where, when, and what is happening).
4. Wait for confirmation that your report was received.
5. Watch for follow-up advisories and safety updates.

Example:

"Flooding near the public market since 6:30 PM. Water is knee-deep and rising."

### For DRRM Responders

1. Sign in to the HERMES control center dashboard.
2. Review incoming reports in the live incident list and map.
3. Validate or edit report details when needed.
4. Update incident status and dispatch actions.
5. Send advisories to affected residents.

Real-life use case:

- A resident reports a flood through chat.
- The system organizes the message into a report.
- A responder validates the report and sends an advisory to nearby residents.

## Tech Stack

High-level tools used in this project:

- Next.js (web app framework)
- Supabase + PostgreSQL (database and backend services)
- Vercel AI SDK (AI-assisted message understanding)
- Vercel Chat SDK (chat integrations)
- Tailwind CSS + shadcn/ui (interface design)
- MapLibre GL (map visualization)

## Getting Started

You only need a few steps to run HERMES locally.

### 1. Install dependencies

```bash
pnpm install
```

### 2. Add environment settings

```bash
cp .env.example .env.local
```

Then fill in the required values in `.env.local`.

<!-- TODO: add a quick list of required environment variables -->

### 3. Start local services

```bash
supabase start
```

### 4. Run the app

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

Optional (for Telegram webhook testing):

See [docs/setup.md](docs/setup.md) for bot setup and webhook instructions.

## Contributing

Contributions are welcome.

If you want to help, please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

This project is distributed under the [Apache License 2.0](LICENSE).

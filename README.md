<p align="center">
 <img src="docs/images/logo.png" alt="Project HERMES logo" width="220" />
</p>

<p align="center">
 <strong>Project HERMES</strong><br/>
 Hazard and Emergency Reporting, Monitoring, and Evaluation System
</p>

<p align="center">
 A real-time disaster communication control center that turns chat messages into actionable incident intelligence.
</p>

<p align="center">
 <img src="https://img.shields.io/badge/Next.js-App-111111?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=000000" alt="Next.js badge" />
 <img src="https://img.shields.io/badge/Supabase-Backend-111111?style=for-the-badge&logo=supabase&logoColor=white&labelColor=000000" alt="Supabase badge" />
 <img src="https://img.shields.io/badge/PostgreSQL-Database-111111?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=000000" alt="PostgreSQL badge" />
 <img src="https://img.shields.io/badge/AI_SDK-NLP_Parsing-111111?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="AI SDK badge" />
 <img src="https://img.shields.io/badge/Chat_Integrations-Telegram%20%26%20Messenger-111111?style=for-the-badge&logo=telegram&logoColor=white&labelColor=000000" alt="Chat integrations badge" />
</p>

<p align="center">
 <a href="https://project-hermes-drrm.vercel.app/" target="_blank" rel="noopener noreferrer">
  <img src="https://img.shields.io/badge/VIEW%20LIVE%20DEMO-FFB000?style=for-the-badge&logo=vercel&logoColor=000000&labelColor=FFD166" alt="View Live Demo" />
 </a>
</p>

Project HERMES helps communities respond faster during disasters.

Instead of forcing residents to fill long forms, HERMES lets them report incidents through familiar chat apps. The platform then uses AI to convert unstructured messages into structured incident reports, so responders can act quickly with better situational awareness.

For DRRM offices, HERMES is a single control center for incident intake, validation, map-based monitoring, and public advisories.

## The Problem

Emergency communication often breaks down when speed matters most.

- Reports arrive in inconsistent formats.
- Teams manually parse messages, which delays response.
- Critical updates are spread across disconnected channels.
- Responders struggle to keep a real-time, city-wide picture.

## Our Solution

HERMES connects residents and responders through one coordinated workflow:

1. Residents submit incident reports through chat.
2. AI extracts key fields such as type, location, time, severity, and description.
3. Responders validate and manage reports in a live dashboard.
4. DRRM teams send advisories back to affected communities.

This creates a closed loop: report, verify, respond, inform.

## Who Benefits

### Residents

- Faster way to report emergencies
- Easier access to official updates and safety instructions

### DRRMO Officers and Responders

- Faster triage and incident understanding
- Better visibility through live feed and map views
- Easier public communication through targeted advisories

## Real-Life Scenario

During heavy rain, a resident sends:

"Flooding near the public market since 6:30 PM. Water is knee-deep and rising."

HERMES automatically interprets the message, drafts a structured incident report, and surfaces it in the responder dashboard with location context. A responder validates the report, updates status, and sends a localized advisory to nearby residents.

Result: less manual parsing, faster response, better public awareness.

## Core Capabilities

- Chat-based incident reporting (Telegram and Messenger)
- AI-assisted report structuring from free-form text
- Real-time incident monitoring dashboard
- Map-based incident visualization
- Advisory broadcasting and targeting
- Role-based access for responder and admin workflows

## Technology

Built with modern, production-ready web technologies:

- Next.js for the application framework
- Supabase and PostgreSQL for backend and data storage
- Vercel AI SDK for AI-assisted language understanding
- Vercel Chat SDK for messaging integrations
- Tailwind CSS and shadcn/ui for interface design
- MapLibre GL for map visualization

## Getting Started (For Reviewers)

To run the project locally, see [docs/setup.md](docs/setup.md).

## License

This project is distributed under the [Apache License 2.0](LICENSE).

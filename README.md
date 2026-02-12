# HireMe

Automated outreach and job-application platform focused on LinkedIn-style messaging, cold email, and multi-platform applications. The AI model runs locally via Ollama to keep data on-device.

## Overview

HireMe orchestrates:

- Discovery of roles and companies.
- Personalized message and email drafting.
- Multi-channel outreach (LinkedIn, X, Gmail).
- Application submissions on platforms like Unstop and others.
- Local LLM inference with Ollama.

The goal is to streamline high-volume, compliant outreach while preserving personalization and user control.

## Key Features

- Multi-platform outreach queue with per-channel rate limits.
- Draft-first workflow (review, edit, approve before sending).
- Local LLM via Ollama for personalization and privacy.
- Contact and campaign management.
- Application tracking and status updates.
- Template library with A/B variants.
- Audit log for every send and submission.

## Tech Stack

- Next.js (App Router)
- TypeScript
- HeroUI
- Tailwind CSS
- Ollama (local inference)

## Architecture (Planned)

- Web app for workflow, approvals, and status dashboards.
- Background worker for queue processing and platform automations.
- Data store for contacts, campaigns, and activity logs.
- Provider adapters for each platform (LinkedIn, X, Gmail, Unstop, etc.).

## Local Development

```bash
npm install
npm run dev
```

## Local Bot Wiring

HireMe connects the Next.js UI to the Python automation bot via `/api/bot`. Copy `.env.example` to `.env.local` and adjust paths if needed:

```bash
cp .env.example .env.local
```

Key environment variables:

- `OLLAMA_BASE_URL` - local Ollama server URL
- `BOT_WORKDIR` - path to the Python bot folder
- `BOT_PYTHON_PATH` - Python executable
- `BOT_CONFIG_PATH` - bot config file path

## Configuration (Draft)

This project will use environment variables for provider credentials and feature flags.

```bash
# Example only
OLLAMA_BASE_URL=http://localhost:11434
```

## Usage (Planned)

1. Import contacts and target roles.
2. Configure outreach templates and approval rules.
3. Generate drafts with Ollama and review.
4. Send approved messages and emails.
5. Track responses and application status.

## Safety, Compliance, and Ethics

This project is intended for responsible outreach. You are responsible for compliance with platform terms, spam laws, and privacy regulations. Use opt-in, rate limits, and human review where required.

## Roadmap

- Provider adapters and secure credential storage.
- Campaign scheduling with throttling.
- Auto follow-up sequences with guardrails.
- Analytics dashboard for response rates.
- Import/export for CRM tools.

## License

MIT

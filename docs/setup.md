# Setup Guide

## 1. Clone the repository

## 2. Configure environment variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env.local
```

## 3. Set up Telegram bot

Create a new bot named `project_hermes_<your-name>_bot`.

Update `.env.local` with the bot token, webhook secret token, and bot name.

Run ngrok to expose the development server to the internet:

```sh
ngrok http 3000
```

Update the webhook URL with the ngrok URL:

```sh
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-subdomain>.ngrok-free.dev/api/webhooks/telegram",
    "secret_token": "$TELEGRAM_WEBHOOK_SECRET_TOKEN"
  }'
```

## 4. Install dependencies

```bash
pnpm install
```

## 5. Start database

```bash
supabase start
```

## 6. Run the development server

```bash
pnpm dev
```

Visit `http://localhost:3000` to view the app.

# Setup Guide

## 1. Clone the repository

## 2. Configure environment variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env.local
```

## 3. Set up AI API

Create a new API key in <https://aistudio.google.com> and update `.env.local` with the API key.

## 4. Set up Telegram bot

Go to [telegram](https://web.telegram.org/k/#@BotFather) and press Start.

Create a new bot named `project_hermes_<your-name>_bot` by typing `/newbot`.

Update `.env.local` with the bot token, webhook secret token, and bot name.

Run ngrok to expose the development server to the internet:

Need to have a ngrok account first [ngrok]https://dashboard.ngrok.com/signup

Go to Authtoken and use

```sh
ngrok config add-authtoken <Ngrok-Authtoken>
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

## 5. Install dependencies

```bash
pnpm install
```

## 6. Start database

- Make an account in [Supabase]`https://supabase.com/dashboard/sign-in?returnTo=%2Forg`
- Get Project URL and Publishable key -> .env.local
- Have Docker Desktop installed and running

```bash
pnpx supabase start
```

## 7. Run the development server

```bash
pnpm dev
```

Visit `http://localhost:3000` to view the app.

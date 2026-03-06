# Testing Webhooks Locally with ngrok

## What is ngrok?
ngrok creates a temporary public URL that tunnels to your localhost, allowing Whapi to send webhooks to your local development server.

## Setup Steps

### 1. Install ngrok
```bash
# macOS with Homebrew
brew install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start your Next.js dev server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 3. Start ngrok tunnel (in another terminal)
```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding    https://abc123def.ngrok.app -> http://localhost:3000
```

### 4. Configure Whapi Webhook

1. Go to Whapi.Cloud dashboard
2. Select your channel
3. Go to Settings → Webhooks
4. Set webhook URL to: `https://abc123def.ngrok.app/api/webhook`
5. Generate a webhook secret (any random string) and save it
6. Add the secret to `.env.local` as `WHAPI_WEBHOOK_SECRET`

### 5. Test it!

Send a WhatsApp message to your Whapi number, and it should hit your local webhook endpoint.

## Important Notes

- The ngrok URL changes every time you restart it (unless you have a paid plan)
- You'll need to update the Whapi webhook URL each time the ngrok URL changes
- This is ONLY for development - use a real domain for production

## Alternative: Skip Webhooks for Now

You can test sending messages without webhooks:
```bash
npx tsx scripts/test-whapi.ts 971501234567 "Test message"
```

Build the webhook endpoint later when you're ready to deploy.

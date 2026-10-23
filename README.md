# HiMessage 🎭

Anonymous messaging Discord bot — users send messages through a button, host reveals them in the channel.

## Features

- `?himassage` — Start anonymous session with a button panel
- `?next` — Reveal next queued message in channel (DM the bot)
- `?jooji` — Stop the session and disable the button
- `?tiro` — Show how many messages are in queue
- `?vc` — Join your voice channel 24/7 with looping music
- `?vc off` — Leave voice channel
- `?clear <n>` — Bulk delete messages
- `?ping` — Show bot latency and uptime
- `?tilmaan` — Show all commands
- `?caawin` — (Owner DM only) List all servers bot is in

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your values
3. Install dependencies:
   ```
   npm install
   ```
4. Run the bot:
   ```
   npm start
   ```

## Required Bot Permissions

- Read Messages / View Channels
- Send Messages
- Manage Messages (for ?clear and auto-delete)
- Connect + Speak (for voice channel)
- Use Slash Commands / Embed Links

## Prefix

All commands use the `?` prefix.

require('dotenv').config();

const {
  Client, GatewayIntentBits, Partials, Events, ActivityType,
} = require('discord.js');

const { handleHimassage }   = require('./src/commands/himassage');
const { handleNext }        = require('./src/commands/next');
const { handleStop }        = require('./src/commands/stop');
const { handleTilmaan }     = require('./src/commands/tilmaan');
const { handleTiro }        = require('./src/commands/tiro');
const { handleVc }          = require('./src/commands/vc');
const { handleClear }       = require('./src/commands/clear');
const { handleCaawin }      = require('./src/commands/caawin');
const { handlePing }        = require('./src/commands/ping');
const { handleQueue }       = require('./src/commands/queue');
const { handleSkip }        = require('./src/commands/skip');
const { handleReset }       = require('./src/commands/reset');
const { handleButton }      = require('./src/interactions/button');
const { handleModalSubmit } = require('./src/interactions/modal');

const PREFIX = '?';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

function updateStatus() {
  const count = client.guilds.cache.size;
  client.user?.setActivity(`?tilmaan | ${count} servers`, { type: ActivityType.Watching });
}

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 10 * 60 * 1000);
});

client.on(Events.GuildCreate, updateStatus);
client.on(Events.GuildDelete, updateStatus);

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args    = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args[0]?.toLowerCase();
  const rest    = args.slice(1);

  try {
    switch (command) {
      case 'himassage': await handleHimassage(message); break;
      case 'next':      await handleNext(message, client); break;
      case 'jooji':     await handleStop(message, client); break;
      case 'tilmaan':   await handleTilmaan(message); break;
      case 'tiro':      await handleTiro(message); break;
      case 'vc':        await handleVc(message, rest); break;
      case 'clear':     await handleClear(message, rest); break;
      case 'caawin':    await handleCaawin(message, client); break;
      case 'ping':      await handlePing(message); break;
      case 'queue':     await handleQueue(message, client); break;
      case 'skip':      await handleSkip(message); break;
      case 'reset':     await handleReset(message); break;
      default: break;
    }
  } catch (err) {
    console.error(`[Error] command=${command}`, err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton())           await handleButton(interaction);
    else if (interaction.isModalSubmit()) await handleModalSubmit(interaction, client);
  } catch (err) {
    console.error('[Error] interaction', err);
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

client.login(token).catch((err) => {
  console.error('❌ Failed to login:', err);
  process.exit(1);
});

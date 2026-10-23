const { EmbedBuilder } = require('discord.js');
const { deleteMessage } = require('../lib/deleteMessage');

function formatUptime(ms) {
  if (!ms) return '0s';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

async function handlePing(message) {
  const sent    = await message.reply('🏓 Calculating...');
  const latency = sent.createdTimestamp - message.createdTimestamp;
  const ws      = message.client.ws.ping;
  const uptime  = formatUptime(message.client.uptime);

  await sent.edit({
    content: '',
    embeds: [
      new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor(latency < 100 ? 0x57f287 : latency < 300 ? 0xfee75c : 0xed4245)
        .addFields(
          { name: '📡 Latency',  value: `**${latency}ms**`, inline: true },
          { name: '💓 WebSocket', value: `**${ws}ms**`,      inline: true },
          { name: '⏱️ Uptime',   value: `**${uptime}**`,    inline: true },
        )
        .setFooter({ text: 'HiMessage Bot' })
        .setTimestamp()
    ]
  });

  await deleteMessage(message);
}

module.exports = { handlePing };

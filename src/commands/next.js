const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');
const { deleteMessage } = require('../lib/deleteMessage');

async function handleNext(message, client) {
  const userId = message.author.id;
  const isDM   = !message.guild;

  const session = isDM
    ? db.getSessionByHost(userId)
    : db.getSession(message.guild.id);

  if (!session || session.hostId !== userId) {
    return message.reply('❌ Adigu host ma tihid session socota, ama session ma jirto.');
  }

  const msg = db.getNextPending(session.guildId);
  if (!msg) return message.reply('📭 Queue-ka fariimo ma jiraan.');

  db.markDisplayed(msg.id);
  const remaining = db.countPending(session.guildId);

  try {
    const guild   = await client.guilds.fetch(session.guildId);
    const channel = await guild.channels.fetch(session.channelId);

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎭 Anonymous Message')
          .setDescription(`"${msg.content}"`)
          .setColor(0x5865f2)
          .setFooter({ text: `${remaining} fariin ayaa ku sugaysa queue-ka` })
      ]
    });
  } catch {
    return message.reply('❌ Channel-ka fariinta lagu dayn kari waayo.');
  }

  if (isDM) {
    await message.reply(`✅ Fariinta channel-ka lagu soo bandhigay. **${remaining}** ayaa hadhay.`);
  }

  await deleteMessage(message);
}

module.exports = { handleNext };

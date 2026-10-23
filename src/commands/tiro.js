const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');
const { deleteMessage } = require('../lib/deleteMessage');

async function handleTiro(message) {
  const userId = message.author.id;
  const isDM   = !message.guild;

  const session = isDM ? db.getSessionByHost(userId) : db.getSession(message.guild.id);
  if (!session) return message.reply('❌ Session socota ma jirto.');

  const guildId   = session.guildId;
  const pending   = db.countPending(guildId);
  const displayed = db.countDisplayed(guildId);
  const total     = pending + displayed;

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle('📊 Fariimaha Tirooyinka')
        .setColor(0x5865f2)
        .addFields(
          { name: '⏳ Queue-ka (la sugayo)', value: `**${pending}**`,   inline: true },
          { name: '✅ La soo bandhigay',      value: `**${displayed}**`, inline: true },
          { name: '📨 Wadarta',               value: `**${total}**`,    inline: true },
        )
        .setFooter({
          text: pending > 0
            ? '?next ku isticmaal si aad ugu soo bandhigto channel-ka'
            : 'Queue-ka waa bannaanaan yahay',
        })
    ]
  });

  await deleteMessage(message);
}

module.exports = { handleTiro };

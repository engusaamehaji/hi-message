const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');
const { deleteMessage } = require('../lib/deleteMessage');

async function handleReset(message) {
  const userId = message.author.id;
  const isDM   = !message.guild;

  const session = isDM ? db.getSessionByHost(userId) : db.getSession(message.guild?.id);
  if (!session) return message.reply('❌ Session socota ma jirto.');
  if (session.hostId !== userId) return message.reply('❌ Keliya host-ku `?reset` isticmaali karaa.');

  const allPending = db.getAllPending(session.guildId);
  if (allPending.length === 0) return message.reply('📭 Queue-ka horey waa bannaan yahay.');

  // Mark all pending as displayed
  for (const m of allPending) db.markDisplayed(m.id);

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle('🗑️ Queue waa la nadiifiyay')
        .setDescription(`**${allPending.length}** fariin oo pending ah ayaa oo dhan si qarsoodi ah loo tirtiiray.\nQueue-ka hadda waa bannaan yahay.`)
        .setColor(0xed4245)
        .setTimestamp()
    ]
  });

  await deleteMessage(message);
}

module.exports = { handleReset };

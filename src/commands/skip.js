const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');
const { deleteMessage } = require('../lib/deleteMessage');

async function handleSkip(message) {
  const userId = message.author.id;
  const isDM   = !message.guild;

  const session = isDM ? db.getSessionByHost(userId) : db.getSession(message.guild?.id);
  if (!session) return message.reply('❌ Session socota ma jirto.');
  if (session.hostId !== userId) return message.reply('❌ Keliya host-ku `?skip` isticmaali karaa.');

  const pending = db.getNextPending(session.guildId);
  if (!pending) return message.reply('📭 Queue-ka waa bannaan yahay — skip gareyn karo waxba.');

  db.markDisplayed(pending.id);
  const remaining = db.countPending(session.guildId);

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle('⏩ Fariinta la skip garay')
        .setDescription(`Fariinta xigta queue-ka si qarsoodi ah waa loo tirtiiray.\n\n**${remaining}** fariin ayaa hadhay.`)
        .setColor(0xfee75c)
        .setTimestamp()
    ]
  });

  await deleteMessage(message);
}

module.exports = { handleSkip };

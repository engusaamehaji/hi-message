const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');
const { deleteMessage } = require('../lib/deleteMessage');

const PEEK = 5;

async function handleQueue(message, client) {
  const userId = message.author.id;
  const isDM   = !message.guild;

  let session;
  if (isDM) {
    session = db.getSessionByHost(userId);
  } else {
    session = db.getSession(message.guild.id);
    if (session && session.hostId !== userId) {
      return message.reply('❌ Keliya host-ku `?queue` isticmaali karaa.');
    }
  }

  if (!session) {
    return message.reply('❌ Session socota ma jirto, ama adigu host ma tihid.');
  }

  const allPending = db.getAllPending(session.guildId);
  if (allPending.length === 0) {
    return message.reply('📭 Queue-ka waa bannaan yahay — fariimo ma jiraan.');
  }

  const shown   = allPending.slice(0, PEEK);
  const hasMore = allPending.length > PEEK;

  const embed = new EmbedBuilder()
    .setTitle(`👀 Queue Preview — Fariimaha Xiga (${shown.length}${hasMore ? '+' : ''})`)
    .setColor(0x5865f2)
    .setDescription(
      shown
        .map((m, i) => {
          const text = m.content.length > 120 ? m.content.slice(0, 120) + '…' : m.content;
          return `**${i + 1}.** "${text}"`;
        })
        .join('\n\n')
    )
    .setFooter({
      text: hasMore
        ? `${allPending.length - PEEK}+ fariin oo kale ayaa queue-ka jooga • ?next si aad u soo bandhigto`
        : `${shown.length} fariin queue-ka • ?next si aad u soo bandhigto`,
    })
    .setTimestamp();

  // Send privately via DM if called from server
  if (!isDM) {
    try {
      const member = await message.guild.members.fetch(userId);
      await member.send({ embeds: [embed] });
      await message.reply('📬 Queue-ka DM-ka kuu diray — si qarsoodi ah.');
    } catch {
      await message.reply({ embeds: [embed] });
    }
  } else {
    await message.reply({ embeds: [embed] });
  }

  await deleteMessage(message);
}

module.exports = { handleQueue };

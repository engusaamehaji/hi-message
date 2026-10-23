const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../lib/db');

async function handleStop(message, client) {
  const userId = message.author.id;
  let session;

  if (message.guild) {
    const member  = message.guild.members.cache.get(userId);
    const isAdmin = member?.permissions.has('ManageMessages') ?? false;
    session = db.getSession(message.guild.id);
    if (!session) return message.reply('❌ Session socota ma jirto.');
    if (session.hostId !== userId && !isAdmin) {
      return message.reply('❌ Adiga keliya host-ka ama admin-ku session joojin karaan.');
    }
  } else {
    session = db.getSessionByHost(userId);
    if (!session) return message.reply('❌ Adigu host ma tihid session socota.');
  }

  db.closeSession(session.guildId);

  try {
    const guild   = await client.guilds.fetch(session.guildId);
    const channel = await guild.channels.fetch(session.channelId);
    const panelMsg = await channel.messages.fetch(session.messageId);

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('anon_send_disabled')
        .setLabel('✍️ Fariin Dir')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    await panelMsg.edit({ components: [disabledRow] });

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔒 Anonymous session xidhmay.')
          .setDescription('Fariimo cusub loo dirin karo.')
          .setColor(0xed4245)
      ]
    });
  } catch {}

  await message.reply('✅ Session waa la xidhmay.');
  try { if (message.guild) await message.delete(); } catch {}
}

module.exports = { handleStop };

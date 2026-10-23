const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../lib/db');

async function handleHimassage(message) {
  if (!message.guild) {
    return message.reply('❌ This command can only be used in a server channel.');
  }

  const guildId = message.guild.id;
  const hostId  = message.author.id;
  const channel = message.channel;

  const existing = db.getSession(guildId);
  if (existing) {
    return message.reply('❌ Session horey ayaa u socota. `?jooji` isticmaal si aad u joogsato.');
  }

  const embed = new EmbedBuilder()
    .setTitle('🎭 Anonymous Messages')
    .setDescription('Qor fariin qarsoodi ah adigoo riixaya button-ka hoose.\n\n> Magacaagu waa la qariyaa — host-ka ayaa keliya fariimaha helaya.')
    .setColor(0x5865f2)
    .setFooter({ text: 'Fariintaadu waxay tegi doontaa si qarsoodi ah' });

  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('anon_send')
      .setLabel('✍️ Fariin Dir')
      .setStyle(ButtonStyle.Primary)
  );

  const panel = await channel.send({ embeds: [embed], components: [button] });

  db.upsertSession(guildId, {
    channelId: channel.id,
    messageId: panel.id,
    hostId,
    active: true,
  });

  try {
    const hostUser = await message.guild.members.fetch(hostId);
    await hostUser.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('✅ Anonymous Session Started')
          .setDescription(
            `Session waxay ku bilawday **${message.guild.name}** — **#${channel.name}**.\n\n` +
            `Fariimaha si qarsoodi ah loo diray waxay kugu yimaadaan halkan DM ahaan.\n\n` +
            `**Commands-ka DM-ka ku isticmaal:**\n` +
            `\`?next\` — Fariinta xigta channel-ka ku soo bandhig\n` +
            `\`?jooji\` — Session xidh`
          )
          .setColor(0x57f287)
      ]
    });
  } catch {}

  try { await message.delete(); } catch {}
}

module.exports = { handleHimassage };

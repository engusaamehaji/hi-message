const { EmbedBuilder } = require('discord.js');
const db = require('../lib/db');

const COOLDOWN_SECONDS  = 30;
const MAX_MESSAGE_LENGTH = 1000;
const DM_BATCH_NOTIFY   = 10;

async function handleModalSubmit(interaction, client) {
  if (!interaction.guild) return;

  const guildId = interaction.guild.id;
  const userId  = interaction.user.id;

  await interaction.deferReply({ ephemeral: true });

  const session = db.getSession(guildId);
  if (!session) {
    return interaction.editReply({ content: '❌ Anonymous session waa la xidhay.' });
  }

  const cooldown = db.getCooldown(guildId, userId);
  if (cooldown) {
    const left = Math.ceil((new Date(cooldown.expiresAt) - Date.now()) / 1000);
    return interaction.editReply({ content: `⏳ Sug **${left}s** ka hor inta aadan fariin kale dirin.` });
  }

  const content = interaction.fields.getTextInputValue('anon_message_input').trim();
  if (!content) return interaction.editReply({ content: '❌ Fariintu maa buuxin.' });
  if (content.length > MAX_MESSAGE_LENGTH) {
    return interaction.editReply({ content: `❌ Fariintu aad bay u dheer tahay (ugu badan ${MAX_MESSAGE_LENGTH} xaraf).` });
  }

  db.addMessage(guildId, userId, content);
  db.setCooldown(guildId, userId, COOLDOWN_SECONDS);

  const pendingCount = db.countPending(guildId);

  try {
    const hostUser = await client.users.fetch(session.hostId);

    await hostUser.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('📩 Fariin Qarsoodi ah — Cusub')
          .setDescription(`"${content}"`)
          .setColor(0x5865f2)
          .setFooter({ text: `${pendingCount} fariin ayaa queue-ka sugaysa • ?next si aad u soo bandhigto` })
          .setTimestamp()
      ]
    });

    if (pendingCount > 0 && pendingCount % DM_BATCH_NOTIFY === 0) {
      await hostUser.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🔔 ${pendingCount} Fariin ayaa Queue-ka!`)
            .setDescription(`**${pendingCount}** fariin qarsoodi ah ayaa ku sugaya.\n\`?next\` ku qor si aad ugu soo bandhigto channel-ka.`)
            .setColor(0xfee75c)
        ]
      });
    }
  } catch {}

  await interaction.editReply({ content: '✅ Fariintaada si qarsoodi ah ayaa loo diray!' });
}

module.exports = { handleModalSubmit };

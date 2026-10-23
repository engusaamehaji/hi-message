const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../lib/db');

async function handleButton(interaction) {
  // ── Close ?tilmaan embed ──────────────────────────────────────────────────
  if (interaction.customId === 'close_tilmaan') {
    try {
      await interaction.message.delete();
    } catch {
      await interaction.reply({ content: '❌ Tirtiri kari waayo.', ephemeral: true });
    }
    return;
  }

  // ── Anonymous send button ─────────────────────────────────────────────────
  if (interaction.customId !== 'anon_send') return;
  if (!interaction.guild) return;

  const session = db.getSession(interaction.guild.id);
  if (!session) {
    return interaction.reply({ content: '❌ The anonymous session has been closed.', ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId('anon_message_modal')
    .setTitle('Anonymous Message');

  const textInput = new TextInputBuilder()
    .setCustomId('anon_message_input')
    .setLabel('Write your message...')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(new ActionRowBuilder().addComponents(textInput));
  await interaction.showModal(modal);
}

module.exports = { handleButton };

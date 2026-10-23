const { EmbedBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;

async function handleCaawin(message, client) {
  if (message.author.id !== OWNER_ID) {
    return message.reply('❌ Command-kani owner-ka ayuu u gooni yahay.');
  }
  if (message.guild) {
    await message.reply('❌ Command-kan DM-ka bot-ka ugu dir.');
    try { await message.delete(); } catch {}
    return;
  }

  const guilds  = client.guilds.cache;
  const total   = guilds.size;
  const list    = guilds.map(g => `• **${g.name}** — ${g.memberCount} members`).slice(0, 25).join('\n');

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`🌐 Servers-ka HiMessage (${total})`)
        .setDescription(list || 'Servers ma jiraan.')
        .setColor(0x5865f2)
        .setFooter({ text: total > 25 ? `+ ${total - 25} server oo kale` : `Wadarta: ${total} server` })
        .setTimestamp()
    ]
  });
}

module.exports = { handleCaawin };

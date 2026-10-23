const { PermissionFlagsBits } = require('discord.js');

const MAX_BULK = 100;

async function handleClear(message, args) {
  if (!message.guild) {
    return message.reply('❌ Command-kani server-ka ayuu u baahan yahay.');
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return message.reply('❌ Adigu **Manage Messages** permission kuma lihid.');
  }

  const amount = parseInt(args[0] ?? '', 10);
  if (isNaN(amount) || amount < 1 || amount > MAX_BULK) {
    return message.reply(`❌ Tiro sax ah qor (1–${MAX_BULK}). Tusaale: \`?clear 10\``);
  }

  try {
    const toDelete = Math.min(amount + 1, MAX_BULK);
    const deleted  = await message.channel.bulkDelete(toDelete, true);
    const count    = deleted.size - 1;

    const reply = await message.channel.send(`🗑️ **${count}** fariin waa la tirtiray.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  } catch {
    await message.reply('❌ Tirtirku ku guul-darreystay. Hubi bot-ku **Manage Messages** permission leeyahay, iyo fariimahu 14 maalmood ka da\'yeynin.');
  }
}

module.exports = { handleClear };

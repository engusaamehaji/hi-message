const { getVoiceConnection } = require('@discordjs/voice');
const { joinAndPersist, clearPersistentVc } = require('../lib/vcManager');

async function handleVc(message, args) {
  if (!message.guild) {
    return message.reply('❌ Command-kani server-ka ayuu u baahan yahay.');
  }

  const sub     = args[0]?.toLowerCase();
  const guildId = message.guild.id;

  if (sub === 'off') {
    clearPersistentVc(guildId);
    const connection = getVoiceConnection(guildId);
    if (connection) {
      connection.destroy();
      await message.reply('👋 Bot-ku VC ka baxay.');
    } else {
      await message.reply('❌ Bot-ku VC kuma jiro.');
    }
    try { await message.delete(); } catch {}
    return;
  }

  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    return message.reply('❌ Marka hore VC gal, ka dibna `?vc` qor.');
  }

  try {
    await joinAndPersist(voiceChannel, message.client);
    await message.reply(`🔊 Bot-ku **${voiceChannel.name}** ayuu ku galay — 24/7 + music 🎵`);
  } catch {
    await message.reply('❌ VC-ga lagu galin kari waayo. Hubi bot-ku **Connect** permission leeyahay.');
  }

  try { await message.delete(); } catch {}
}

module.exports = { handleVc };

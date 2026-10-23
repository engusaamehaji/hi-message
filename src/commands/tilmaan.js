const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { deleteMessage } = require('../lib/deleteMessage');

async function handleTilmaan(message) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Bot Commands — HiMessage')
    .setColor(0x5865f2)
    .addFields(
      { name: '🎭  `?himassage`',    value: 'Server-ka ku bilow anonymous session cusub.', inline: false },
      { name: '⏭️  `?next`',         value: 'Fariinta xigta channel-ka ku soo bandhig.\n> DM bot-ka ku isticmaal.', inline: false },
      { name: '👀  `?queue`',        value: 'Queue-ka fariimaha xiga si qarsoodi ah u fiiri (DM).\n> Host keliya.', inline: false },
      { name: '⏩  `?skip`',         value: 'Fariinta xigta queue-ka si qarsoodi ah tirtir — channel-ka lama bandhigo.\n> Host keliya.', inline: false },
      { name: '📊  `?tiro`',         value: 'Queue-ka fariimaha tirooyinka soo bandhig.', inline: false },
      { name: '🗑️  `?reset`',        value: 'Queue-ka oo dhan nadiifi — fariimaha pending oo dhan tirtir.\n> Host keliya.', inline: false },
      { name: '🔒  `?jooji`',        value: 'Session xidh. Send button-ka waa la disable garayaa.', inline: false },
      { name: '🔊  `?vc`',           value: 'Bot-ka VC-ga aad ku jirto ku soo gal — 24/7 + music 🎵', inline: false },
      { name: '🔇  `?vc off`',       value: 'Bot-ka VC-ga ka saar oo jooji.', inline: false },
      { name: '🗑️  `?clear <n>`',    value: 'Channel-ka fariimo tiro ah tirtir. Tusaale: `?clear 10`', inline: false },
      { name: '🏓  `?ping`',         value: 'Bot-ka latency-ga iyo uptime-ka soo bandhig.', inline: false },
      { name: '📋  `?tilmaan`',      value: 'Commands-kan oo dhan soo bandhig.', inline: false },
    )
    .addFields({
      name: 'ℹ️  Sida loo isticmaalo',
      value:
        '**1.** Host waxuu ku qoraa `?himassage` channel-ka\n' +
        '**2.** Users-ku waxay riixaan **✍️ Fariin Dir** — si qarsoodi ah\n' +
        '**3.** Host-ku waxuu heli doonaa **DM** fariin walba\n' +
        '**4.** `?queue` — si qarsoodi ah u arag fariimaha xiga\n' +
        '**5.** `?next` — channel-ka ku soo bandhig\n' +
        '**6.** `?skip` — fariinta xigta tirtir (aan la bandhigin)\n' +
        '**7.** `?reset` — queue-ka oo dhan nadiifi\n' +
        '**8.** `?jooji` — session xidh markii aad dhamaatid',
      inline: false,
    })
    .setFooter({ text: 'Fariimaha weligood qarsoodi ah — magaca la diraha weligiis ma muuqdo' });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_tilmaan')
      .setLabel('✖ Close')
      .setStyle(ButtonStyle.Secondary)
  );

  await message.reply({ embeds: [embed], components: [closeRow] });
  await deleteMessage(message);
}

module.exports = { handleTilmaan };

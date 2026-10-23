async function deleteMessage(message) {
  if (!message.guild) return;
  try { await message.delete(); } catch { /* no permission or already gone */ }
}

module.exports = { deleteMessage };

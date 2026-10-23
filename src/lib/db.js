const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; }
}
function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function getSessions()       { return readJson('sessions.json'); }
function saveSessions(s)     { writeJson('sessions.json', s); }

function getSession(guildId) {
  return getSessions().find(s => s.guildId === guildId && s.active) || null;
}
function getSessionByHost(userId) {
  return getSessions().find(s => s.hostId === userId && s.active) || null;
}
function upsertSession(guildId, data) {
  const all = getSessions();
  const idx = all.findIndex(s => s.guildId === guildId);
  if (idx >= 0) { all[idx] = { ...all[idx], ...data }; }
  else { all.push({ id: Date.now().toString(), guildId, ...data, createdAt: new Date().toISOString() }); }
  saveSessions(all);
}
function closeSession(guildId) {
  saveSessions(getSessions().map(s => s.guildId === guildId && s.active ? { ...s, active: false } : s));
}

// ── Messages ──────────────────────────────────────────────────────────────────
function getMessages()   { return readJson('messages.json'); }
function saveMessages(m) { writeJson('messages.json', m); }

function addMessage(guildId, authorId, content) {
  const all = getMessages();
  all.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    guildId, authorId, content, displayed: false,
    createdAt: new Date().toISOString(),
  });
  saveMessages(all);
}
function getNextPending(guildId) {
  return getMessages().find(m => m.guildId === guildId && !m.displayed) || null;
}
function getAllPending(guildId) {
  return getMessages().filter(m => m.guildId === guildId && !m.displayed);
}
function markDisplayed(id) {
  saveMessages(getMessages().map(m => m.id === id ? { ...m, displayed: true } : m));
}
function countPending(guildId) {
  return getMessages().filter(m => m.guildId === guildId && !m.displayed).length;
}
function countDisplayed(guildId) {
  return getMessages().filter(m => m.guildId === guildId && m.displayed).length;
}

// ── Cooldowns ─────────────────────────────────────────────────────────────────
function getCooldowns()   { return readJson('cooldowns.json'); }
function saveCooldowns(c) { writeJson('cooldowns.json', c); }

function getCooldown(guildId, userId) {
  const now = Date.now();
  return getCooldowns().find(c =>
    c.guildId === guildId && c.userId === userId && new Date(c.expiresAt).getTime() > now
  ) || null;
}
function setCooldown(guildId, userId, seconds) {
  const all = getCooldowns().filter(c => !(c.guildId === guildId && c.userId === userId));
  all.push({ guildId, userId, expiresAt: new Date(Date.now() + seconds * 1000).toISOString() });
  saveCooldowns(all);
}

module.exports = {
  getSession, getSessionByHost, upsertSession, closeSession,
  addMessage, getNextPending, getAllPending, markDisplayed, countPending, countDisplayed,
  getCooldown, setCooldown,
};

const {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');
const { Readable } = require('stream');
const https = require('https');
const http  = require('http');
const { spawn } = require('child_process');

// Use system ffmpeg if available, otherwise fall back to ffmpeg-static
let ffmpegPath = 'ffmpeg';
try {
  ffmpegPath = require('ffmpeg-static') || 'ffmpeg';
} catch { /* use system ffmpeg */ }

const RADIO_STREAMS = [
  'https://streams.ilovemusic.de/iloveradio17.mp3',
  'https://ice2.somafm.com/groovesalad-256-mp3',
  'https://streams.ilovemusic.de/iloveradio2.mp3',
];

const persistentVc = new Map();
const watchdogs    = new Map();
const players      = new Map();

function clearPersistentVc(guildId) {
  persistentVc.delete(guildId);
  const t = watchdogs.get(guildId);
  if (t) { clearInterval(t); watchdogs.delete(guildId); }
  const p = players.get(guildId);
  if (p) { p.stop(true); players.delete(guildId); }
}

async function joinAndPersist(channel, client) {
  const { id: channelId, guild } = channel;
  persistentVc.set(guild.id, channelId);
  _connect(channelId, guild.id, guild.voiceAdapterCreator);
  _startWatchdog(guild.id, client);
}

function fetchStream(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchStream(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      resolve(res);
    }).on('error', reject);
  });
}

async function getRadioStream() {
  for (const url of RADIO_STREAMS) {
    try { return await fetchStream(url); } catch { /* try next */ }
  }
  return _silenceStream();
}

const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);
function _silenceStream() {
  const stream = new Readable({ read() {} });
  const iv = setInterval(() => {
    if (stream.destroyed) { clearInterval(iv); return; }
    stream.push(SILENCE_FRAME);
  }, 20);
  stream.on('close', () => clearInterval(iv));
  return stream;
}

function _connect(channelId, guildId, adapterCreator) {
  try {
    const existing = getVoiceConnection(guildId);
    if (existing) { try { existing.destroy(); } catch {} }

    const connection = joinVoiceChannel({ channelId, guildId, adapterCreator, selfMute: false, selfDeaf: true });

    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
    players.set(guildId, player);
    connection.subscribe(player);

    const startPlaying = async () => {
      try {
        const rawStream = await getRadioStream();
        const ffmpeg = spawn(ffmpegPath, [
          '-i', 'pipe:0', '-analyzeduration', '0', '-loglevel', '0',
          '-f', 'opus', '-ar', '48000', '-ac', '2', 'pipe:1',
        ]);
        rawStream.pipe(ffmpeg.stdin);
        ffmpeg.stdin.on('error', () => {});
        ffmpeg.on('error', () => {
          if (persistentVc.has(guildId)) setTimeout(startPlaying, 3000);
        });
        const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.OggOpus, inlineVolume: false });
        player.play(resource);
      } catch {
        if (persistentVc.has(guildId)) setTimeout(startPlaying, 5000);
      }
    };

    player.on(AudioPlayerStatus.Idle, () => {
      if (persistentVc.has(guildId)) setTimeout(startPlaying, 1000);
    });
    player.on('error', () => {
      if (persistentVc.has(guildId)) setTimeout(startPlaying, 3000);
    });
    connection.on(VoiceConnectionStatus.Ready, () => startPlaying());
    connection.on('error', () => {});
  } catch (err) {
    console.error('[VC] connect error:', err.message);
  }
}

function _startWatchdog(guildId, client) {
  const existing = watchdogs.get(guildId);
  if (existing) clearInterval(existing);

  const timer = setInterval(async () => {
    if (!persistentVc.has(guildId)) { clearInterval(timer); watchdogs.delete(guildId); return; }
    const conn = getVoiceConnection(guildId);
    const ok = conn?.state.status === VoiceConnectionStatus.Ready
            || conn?.state.status === VoiceConnectionStatus.Connecting
            || conn?.state.status === VoiceConnectionStatus.Signalling;
    if (!ok) {
      try {
        const channelId = persistentVc.get(guildId);
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);
        if (channel?.isVoiceBased()) _connect(channelId, guildId, guild.voiceAdapterCreator);
      } catch (err) { console.error('[VC] watchdog rejoin failed:', err.message); }
    }
  }, 30_000);

  watchdogs.set(guildId, timer);
}

module.exports = { joinAndPersist, clearPersistentVc };

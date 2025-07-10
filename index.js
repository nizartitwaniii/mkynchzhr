const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const BOT_TOKEN = '7619814993:AAFSs9zig8B0vzqTmWpRPUNsYVXQ8QOEunM';
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scripts.json');

const app = express();
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let scriptsDB = {};

// تحميل السكربتات من الملف عند بدء التشغيل
async function loadScripts() {
  try {
    const exists = await fs.access(DATA_FILE).then(() => true).catch(() => false);
    if (exists) {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      scriptsDB = JSON.parse(raw);
      console.log('Scripts loaded.');
    }
  } catch (e) {
    console.error('Failed to load scripts:', e);
  }
}

// حفظ السكربتات في الملف
async function saveScripts() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(scriptsDB, null, 2));
    console.log('Scripts saved.');
  } catch (e) {
    console.error('Failed to save scripts:', e);
  }
}

loadScripts();

app.use(express.json());

// صفحة الترحيب
app.get('/', (req, res) => {
  res.send('Welcome to the Roblox Script Protection Service!');
});

// رابط السكربت
app.get('/script.lua', (req, res) => {
  const id = req.query.id;
  if (!id || !scriptsDB[id]) return res.status(404).send('Invalid or expired script link.');

  const ua = req.headers['user-agent'] || '';
  // فقط قبول طلبات من روبلوكس
  if (!ua.includes('Roblox') && !ua.includes('HttpGet')) {
    return res.status(403).send('Access denied: Roblox only.');
  }

  res.type('text/plain').send(scriptsDB[id].script);
});

// بوت تلجرام - استقبال الرسائل
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  if (text.toLowerCase() === '/start') {
    bot.sendMessage(chatId, `مرحباً! أرسل لي سكربت روبلوكس لتحصل على رابط حماية خاص.`);
    return;
  }

  // تخزين السكربت
  // توليد ID فريد
  const scriptId = crypto.randomBytes(8).toString('hex');

  scriptsDB[scriptId] = {
    userId: chatId,
    script: text,
    createdAt: new Date().toISOString()
  };

  await saveScripts();

  // توليد رابط التحميل
  const host = process.env.HOST || `http://localhost:${PORT}`;
  const url = `${host}/script.lua?id=${scriptId}`;

  // توليد loadstring
  const loadstring = `loadstring(game:HttpGet("${url}"))()`;

  // إرسال الرد
  bot.sendMessage(chatId, `✅ تم حفظ السكربت بنجاح!\n\n🔗 رابط السكربت:\n${url}\n\n🎮 Loadstring:\n${loadstring}`);
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

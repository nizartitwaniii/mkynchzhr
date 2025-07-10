const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ======================
// *** إعدادات عامة ***
// ======================

// ضع توكن بوت التليجرام هنا (من BotFather)
const BOT_TOKEN = process.env.BOT_TOKEN || '7619814993:AAFSs9zig8B0vzqTmWpRPUNsYVXQ8QOEunM';

// بورت السيرفر (يمكن Koyeb يعطيه تلقائياً)
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json({ limit: '10kb' }));

// ملف حفظ السكربتات
const DB_FILE = 'scripts.json';
let scriptDB = {};

// تحميل السكربتات من الملف
async function loadScripts() {
  try {
    if (await fs.access(DB_FILE).then(() => true).catch(() => false)) {
      const raw = await fs.readFile(DB_FILE, 'utf8');
      scriptDB = JSON.parse(raw);
      console.log('✅ Loaded scripts from file.');
    }
  } catch (err) {
    console.error('❌ Load error:', err);
  }
}

// حفظ السكربتات في الملف
async function saveScripts() {
  try {
    await fs.writeFile(DB_FILE, JSON.stringify(scriptDB, null, 2));
    console.log('✅ Scripts saved to file.');
  } catch (err) {
    console.error('❌ Save error:', err);
  }
}

loadScripts();

// ==========================
// *** إعداد بوت التليجرام ***
// ==========================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// رسالة ترحيب / start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'أهلاً! أرسل لي سكربت روبلوكس لأقوم بحمايته لك.');
});

// استقبال الرسائل النصية (سكربتات)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // تجاهل أوامر بوت
  if (msg.text.startsWith('/')) return;

  const script = msg.text.trim();
  if (!script) {
    bot.sendMessage(chatId, 'الرجاء إرسال سكربت صالح.');
    return;
  }

  // توليد ID عشوائي
  const id = crypto.randomBytes(8).toString('hex');

  // حفظ السكربت مع معرف المستخدم
  scriptDB[id] = {
    script,
    userId: chatId.toString(),
    createdAt: new Date().toISOString(),
  };
  await saveScripts();

  // رابط التحميل الخاص بالسكربت
  const url = `https://${process.env.DOMAIN || 'yourdomain.com'}/script.lua?id=${id}`;
  const loadstring = `loadstring(game:HttpGet("${url}"))()`;

  bot.sendMessage(chatId, `تم حماية سكربتك! استخدم هذا الـ loadstring:\n\n${loadstring}`);
});

// ==========================
// *** إعدادات السيرفر Express ***
// ==========================

app.get('/', (req, res) => {
  res.send('🚀 بوت حماية سكربتات روبلوكس يعمل!');
});

// استرجاع السكربت بصيغة Lua (لـ loadstring)
app.get('/script.lua', (req, res) => {
  const id = req.query.id;
  if (!id || !scriptDB[id]) {
    return res.status(404).send('رابط غير صالح أو منتهي!');
  }

  // تحقق أن الطلب يأتي من Roblox HttpGet (ببساطة)
  const userAgent = req.headers['user-agent'] || '';
  const isRoblox = userAgent.includes('Roblox') || userAgent.includes('HttpGet');
  if (!isRoblox) {
    return res.status(403).send('الوصول مرفوض: هذا الرابط مخصص لتنفيذ داخل Roblox فقط.');
  }

  res.type('text/plain').send(scriptDB[id].script);
});

// ==========================
// *** Socket.IO للأونلاين ***
// ==========================
let onlineUsers = 0;
io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('onlineUsers', onlineUsers);

  socket.on('disconnect', () => {
    onlineUsers--;
    io.emit('onlineUsers', onlineUsers);
  });
});

// ==========================
// *** بدء السيرفر ***
// ==========================
server.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على البورت ${PORT}`);
});

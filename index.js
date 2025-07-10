const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

const token = '7619814993:AAFSs9zig8B0vzqTmWpRPUNsYVXQ8QOEunM';
const bot = new TelegramBot(token, { polling: true });
const app = express();

// مجلد لحفظ السكربتات
const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir);

// لما يرسل المستخدم سكربت
bot.onText(/\/حماية (.+)/, (msg, match) => {
  const script = match[1];
  const id = Date.now().toString(36);
  const filename = `script-${id}.lua`;
  const filepath = path.join(scriptsDir, filename);

  fs.writeFileSync(filepath, script);

  const url = `https://اسم-تطبيقك.koyeb.app/scripts/${filename}`;
  const protectedLoad = `loadstring(game:HttpGet("${url}"))()`;

  bot.sendMessage(msg.chat.id, `✅ تم حماية السكربت!\nإليك كود التحميل:\n\n${protectedLoad}`);
});

// تقديم ملفات السكربت
app.use('/scripts', express.static(scriptsDir));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

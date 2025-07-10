const TelegramBot = require('node-telegram-bot-api');

// قراءة التوكن من متغير البيئة
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('Error: BOT_TOKEN environment variable is not set.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// الرد على أمر /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'أهلاً! بوت التليجرام شغال 24/7 🔥');
});

// مثال: الرد على كلمة "سلام"
bot.on('message', (msg) => {
  if (msg.text && msg.text.toLowerCase().includes('سلام')) {
    bot.sendMessage(msg.chat.id, 'وعليكم السلام 🌟');
  }
});

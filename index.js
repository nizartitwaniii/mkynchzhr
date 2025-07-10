const TelegramBot = require('node-telegram-bot-api');

// توكن البوت (مضمّن مباشرة)
const token = '7619814993:AAFSs9zig8B0vzqTmWpRPUNsYVXQ8QOEunM';

if (!token) {
  throw new Error('BOT_TOKEN not provided');
}

// إنشاء البوت مع تفعيل الاستطلاع (polling)
const bot = new TelegramBot(token, { polling: true });

// رسالة ترحيب عند بدء البوت
console.log('Telegram bot started successfully.');

// استماع للرسائل النصية
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  console.log(`Received message from ${chatId}: ${text}`);

  // رد بسيط: يرد بنفس الرسالة مع جملة "أنت قلت:"
  bot.sendMessage(chatId, `أنت قلت: ${text}`);
});

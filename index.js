const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'أهلاً بك! ✅ البوت شغال الآن 24/7!');
});

bot.on('message', (msg) => {
  if (msg.text.toLowerCase().includes('سلام')) {
    bot.sendMessage(msg.chat.id, 'وعليكم السلام 🌟');
  }
});

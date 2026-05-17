const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kryvex-system-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

const token = "8532645384:AAF8-2fnLx6yJpmMaQFtF0lN1cLpCb-2F9g";

const bot = new TelegramBot(token, { polling: true });

console.log('Bot Running...');

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  try {
    await db.ref('messages').push({
      user: msg.from.username || 'unknown',
      text,
      time: Date.now()
    });

    bot.sendMessage(chatId, `Saved: ${text}`);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, 'Error saving message');
  }
});

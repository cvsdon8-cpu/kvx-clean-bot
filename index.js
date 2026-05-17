const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');

const app = express();
app.use(express.json());

const serviceAccount = require('./firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kryvex-system-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

const token = "8532645384:AAE1EPd4Ol51amuh49f6G-ZO9wbkeptrPvc";

const bot = new TelegramBot(token);

const url = "https://kvx-clean-bot-production.up.railway.app";

bot.setWebHook(`${url}/bot${token}`)
  .then(() => console.log("Webhook set!"))
  .catch(console.error);

app.post(`/bot${token}`, async (req, res) => {
  const msg = req.body.message;

  if (msg) {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    await db.ref("messages").push({
      user: msg.from.username || "unknown",
      text,
      time: Date.now()
    });

    bot.sendMessage(chatId, `Saved: ${text}`);
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Bot running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running...");
});

const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');

const app = express();
app.use(express.json());

/* FIREBASE */

const serviceAccount = require('./firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kryvex-system-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

/* TELEGRAM */

const token = "8532645384:AAE1EPd4Ol51amuh49f6G-ZO9wbkeptrPvc";

const bot = new TelegramBot(token);

const url = "https://kvx-clean-bot-production.up.railway.app";

bot.setWebHook(`${url}/bot${token}`);

/* BOT */

app.post(`/bot${token}`, async (req, res) => {
  const msg = req.body.message;

  if (!msg) {
    return res.sendStatus(200);
  }

  const chatId = msg.chat.id;
  const text = msg.text || "";
  const username = msg.from.username || "unknown";

  try {

    // SAVE MESSAGE
    await db.ref("messages").push({
      username,
      text,
      time: Date.now()
    });

    // USER SAVE
    await db.ref("users/" + chatId).set({
      username,
      chatId
    });

    // START COMMAND
    if (text === "/start") {

      bot.sendMessage(
        chatId,
        `👋 Welcome to KVX Notes Bot

📝 Send any text
💾 Bot will save it
⚡ Powered by KVX`
      );

      return res.sendStatus(200);
    }

    // ADMIN COMMAND
    if (text === "/users") {

      const snap = await db.ref("users").once("value");

      const total = snap.numChildren();

      bot.sendMessage(chatId, `👥 Total Users: ${total}`);

      return res.sendStatus(200);
    }

    // NORMAL SAVE
    bot.sendMessage(chatId, `✅ Saved: ${text}`);

  } catch (err) {

    console.log(err);

    bot.sendMessage(chatId, "❌ Firebase Error");
  }

  res.sendStatus(200);
});

/* HOME */

app.get("/", (req, res) => {
  res.send("KVX Bot Running ✅");
});

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running...");
});

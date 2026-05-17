const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

/* FILE SYSTEM */

if (!fs.existsSync('notes.json')) {
  fs.writeFileSync('notes.json', '[]');
}

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

  /* START */

  if (text === "/start") {

    bot.sendMessage(
      chatId,
      `👋 Welcome to KVX Notes Bot

📝 Send any message
💾 Bot will save it
📂 Use /notes to see saved notes`
    );

    return res.sendStatus(200);
  }

  /* SHOW NOTES */

  if (text === "/notes") {

    let data = JSON.parse(fs.readFileSync('notes.json'));

    if (data.length === 0) {
      bot.sendMessage(chatId, "❌ No notes found");
      return res.sendStatus(200);
    }

    let notes = data
      .slice(-10)
      .map(x => `👤 ${x.user}\n📝 ${x.text}`)
      .join("\n\n");

    bot.sendMessage(chatId, notes);

    return res.sendStatus(200);
  }

  /* SAVE MESSAGE */

  let data = JSON.parse(fs.readFileSync('notes.json'));

  data.push({
    user: username,
    text,
    time: Date.now()
  });

  fs.writeFileSync('notes.json', JSON.stringify(data, null, 2));

  bot.sendMessage(chatId, `✅ Saved: ${text}`);

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

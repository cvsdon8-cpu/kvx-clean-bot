const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

/* NOTES FILE */

if (!fs.existsSync('notes.json')) {
  fs.writeFileSync('notes.json', '{}');
}

/* TELEGRAM */

const token = "8532645384:AAE1EPd4Ol51amuh49f6G-ZO9wbkeptrPvc";

const bot = new TelegramBot(token);

const url = "https://kvx-clean-bot-production.up.railway.app";

bot.setWebHook(`${url}/bot${token}`);

/* GEMINI API */

const GEMINI_API_KEY = "AIzaSyBY8DgkkTpvOjlaDrziKmQsqSAdL0d7mHM";

/* BOT */

app.post(`/bot${token}`, async (req, res) => {

  const msg = req.body.message;

  if (!msg) {
    return res.sendStatus(200);
  }

  const chatId = msg.chat.id;
  const text = msg.text || "";
  const username = msg.from.username || "unknown";

  let data = JSON.parse(fs.readFileSync('notes.json'));

  /* USER CREATE */

  if (!data[chatId]) {
    data[chatId] = [];
  }

  /* START */

  if (text === "/start") {

    bot.sendMessage(chatId,

`⚡ KVX AI NOTES SYSTEM ⚡

👋 Welcome ${username}

📝 Save Notes
🤖 Gemini AI Assistant
🔍 Search Notes
🚀 Powered by KVX

📌 Commands:

/notes → Show notes
/delete → Delete notes
/count → Total notes
/search word → Search notes
/ai your question → Ask AI
/help → Help panel`
);

    return res.sendStatus(200);
  }

  /* HELP */

  if (text === "/help") {

    bot.sendMessage(chatId,

`🛠 KVX HELP PANEL

/notes → Show notes
/delete → Delete notes
/count → Total notes
/search word → Search notes
/ai your question → Ask AI

⚡ KVX SYSTEM`
);

    return res.sendStatus(200);
  }

  /* AI SYSTEM */

  if (text.startsWith("/ai ")) {

    const prompt = text.replace("/ai ", "");

    try {

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      );

      const result = await response.json();

      const aiText =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "❌ AI Error";

      bot.sendMessage(chatId,

`🤖 KVX AI RESPONSE

${aiText}

⚡ Powered by Gemini AI`
);

    } catch (err) {

      console.log(err);

      bot.sendMessage(chatId,
        "❌ AI request failed"
      );
    }

    return res.sendStatus(200);
  }

  /* SHOW NOTES */

  if (text === "/notes") {

    if (data[chatId].length === 0) {

      bot.sendMessage(chatId,
        "❌ No notes found"
      );

      return res.sendStatus(200);
    }

    let notes = data[chatId]
      .slice(-10)
      .map((x, i) =>
        `${i + 1}. 📝 ${x.text}`
      )
      .join("\n\n");

    bot.sendMessage(chatId,

`📂 YOUR NOTES

${notes}

⚡ KVX SYSTEM`
);

    return res.sendStatus(200);
  }

  /* DELETE */

  if (text === "/delete") {

    data[chatId] = [];

    fs.writeFileSync('notes.json', JSON.stringify(data, null, 2));

    bot.sendMessage(chatId,

`🗑 All your notes deleted

⚡ KVX SYSTEM`
);

    return res.sendStatus(200);
  }

  /* COUNT */

  if (text === "/count") {

    bot.sendMessage(chatId,

`📊 Your Total Notes: ${data[chatId].length}

⚡ KVX SYSTEM`
);

    return res.sendStatus(200);
  }

  /* SEARCH */

  if (text.startsWith("/search ")) {

    const keyword = text.replace("/search ", "").toLowerCase();

    const results = data[chatId]
      .filter(x =>
        x.text.toLowerCase().includes(keyword)
      );

    if (results.length === 0) {

      bot.sendMessage(chatId,
        "❌ No matching notes found"
      );

      return res.sendStatus(200);
    }

    let searchNotes = results
      .slice(-10)
      .map((x, i) =>
        `${i + 1}. 📝 ${x.text}`
      )
      .join("\n\n");

    bot.sendMessage(chatId,

`🔍 SEARCH RESULTS

${searchNotes}

⚡ KVX SYSTEM`
);

    return res.sendStatus(200);
  }

  /* SAVE NOTE */

  data[chatId].push({
    user: username,
    text,
    time: Date.now()
  });

  fs.writeFileSync('notes.json', JSON.stringify(data, null, 2));

  bot.sendMessage(chatId,

`✅ Note Saved Successfully

📝 ${text}

⚡ KVX SYSTEM`
);

  res.sendStatus(200);
});

/* HOME */

app.get("/", (req, res) => {
  res.send("KVX AI SYSTEM RUNNING ✅");
});

/* SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("⚡ KVX AI SERVER RUNNING...");
});

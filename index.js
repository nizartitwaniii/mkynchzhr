const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');

// سيرفر Express
app.get("/", (req, res) => {
  res.send("🔵 Bot is still alive at " + new Date().toISOString());
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

// 🧠 حيلة ذكية 1: Ping داخلي لنفسك (حتى لو بدون إنترنت)
setInterval(() => {
  http.get("http://localhost:" + port, (res) => {
    console.log("📡 Internal self-ping: " + res.statusCode);
  });
}, 60 * 1000); // كل دقيقة

// 🧠 حيلة ذكية 2: Ping خارجي عبر uptimerobot
// لا تحتاج لسكربت لهذا. فقط فعلها كما شرحنا من موقع uptimerobot.com

// 🧠 حيلة ذكية 3: توليد حركة مزيفة
setInterval(() => {
  console.log("🌀 Activity signal: " + new Date().toISOString());
  // افترض أنك تقوم بمعالجة وهمية
  const fake = Math.sqrt(Math.random() * 100000);
}, 30 * 1000); // كل 30 ثانية

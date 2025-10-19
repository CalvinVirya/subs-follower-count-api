const express = require("express");
const axios = require("axios");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const baseApiUrl = "https://youtube.googleapis.com/youtube/v3";
const apiKey = process.env.YOUTUBE_API_KEY;

app.get("/", (req, res) => {
  res.send("Hello from our API");
});

// =========================
// 📺 YOUTUBE API ROUTE
// =========================
app.get("/youtube/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const url = `${baseApiUrl}/channels?part=statistics&forHandle=${handle}&key=${apiKey}`;
    const response = await axios.get(url);

    const stats = response.data.items?.[0]?.statistics;
    if (!stats) return res.status(404).json({ error: "Channel not found" });

    res.json({ handle, subscribers: stats.subscriberCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch YouTube data" });
  }
});

// =========================
// 📸 INSTAGRAM SCRAPER ROUTE
// =========================
app.get("/instagram/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    const followers = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      const text = el ? el.getAttribute("content") : "";
      const match = text.match(/([\d.,]+)\s*([KMB])?\s*Followers/i);

      if (!match) return "Not found";

      const value = parseFloat(match[1].replace(",", "."));
      const suffix = match[2] || null;
      const multipliers = { K: 1e3, M: 1e6, B: 1e9, null: 1 };

      return Math.round(value * multipliers[suffix]);
    });

    await browser.close();
    res.json({ username, followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape Instagram" });
  }
});

// =========================
// 🎵 TIKTOK SCRAPER ROUTE
// =========================
app.get("/tiktok/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.tiktok.com/@${username}`, {
      waitUntil: "networkidle2",
    });

    const followers = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      const text = el ? el.getAttribute("content") : "";
      const match = text.match(/([\d.,]+)\s*([KMB])?\s*Followers/i);

      if (!match) return "Not found";

      const value = parseFloat(match[1].replace(",", "."));
      const suffix = match[2] || null;
      const multipliers = { K: 1e3, M: 1e6, B: 1e9, null: 1 };

      return Math.round(value * multipliers[suffix]);
    });

    await browser.close();
    res.json({ username, followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape TikTok" });
  }
});

export default app;

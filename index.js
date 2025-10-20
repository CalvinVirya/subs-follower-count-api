const express = require("express");
const axios = require("axios");
const puppeteer = require("puppeteer-core");
// 🔽 1. REQUIRE '@sparticuz/chromium' INSTEAD
const chrome = require("@sparticuz/chromium");
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
// (This route is unchanged)
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
  let browser = null;

  try {
    // 🔽 2. LAUNCH PUPPETEER WITH THE NEW PACKAGE
    browser = await puppeteer.launch({
      args: chrome.args,
      // 🔽 3. ADD '()' TO 'executablePath'
      executablePath: await chrome.executablePath(),
      // 🔽 4. USE 'headless: "new"'
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    const followers = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      const text = el ? el.getAttribute("content") : "";
      const match = text.match(/([\d.,])([KMB])?\s*Followers/i);

      if (!match) return "Not found";

      const value = parseFloat(match[1].replace(/,/g, ""));
      const suffix = match[2] ? match[2].toUpperCase() : null;
      const multipliers = { K: 1e3, M: 1e6, B: 1e9, null: 1 };

      return Math.round(value * multipliers[suffix]);
    });

    res.json({ username, followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape Instagram" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// =========================
// 🎵 TIKTOK SCRAPER ROUTE
// =========================
app.get("/tiktok/:username", async (req, res) => {
  const { username } = req.params;
  let browser = null;

  try {
    // 🔽 2. LAUNCH PUPPETEER WITH THE NEW PACKAGE
    browser = await puppeteer.launch({
      args: chrome.args,
      // 🔽 3. ADD '()' TO 'executablePath'
      executablePath: await chrome.executablePath(),
      // 🔽 4. USE 'headless: "new"'
      headless: "new",
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.tiktok.com/@${username}`, {
      waitUntil: "networkidle2",
    });

    const followers = await page.evaluate(() => {
      const el = document.querySelector('meta[name="description"]');
      const text = el ? el.getAttribute("content") : "";
      const match = text.match(/([\d.,]+(?:[.,]\d+)?)\s*([KMB])?\s*Followers/i);

      if (!match) return "Not found";

      const value = parseFloat(match[1].replace(/,/g, ""));
      const suffix = match[2] ? match[2].toUpperCase() : null;
      const multipliers = { K: 1e3, M: 1e6, B: 1e9, null: 1 };

      return Math.round(value * multipliers[suffix]);
    });

    res.json({ username, followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to scrape TikTok" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = app;

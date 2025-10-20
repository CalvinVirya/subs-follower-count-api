const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const baseApiUrl = "https://youtube.googleapis.com/youtube/v3";
const apiKey = process.env.YOUTUBE_API_KEY;

app.get("/", (req, res) => {
  res.send("Hello from our API");
});

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

app.get("/instagram/:username", async (req, res) => {
  const username = req.params.username;

  const options = {
    method: "GET",
    url: "https://instagram-looter2.p.rapidapi.com/profile2",
    params: { username: username },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY, // use .env for security
      "x-rapidapi-host": "instagram-looter2.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    res.json({
      username,
      followers: response.data.follower_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
});

app.get("/tiktok/:username", async (req, res) => {
  const username = req.params.username;

  const options = {
    method: "GET",
    url: "https://tiktok-api23.p.rapidapi.com/api/user/info",
    params: { uniqueId: username },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY, // use .env for security
      "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const data = response.data;

    res.json({
      username,
      followers: data.userInfo.stats.followerCount || "Not found",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch TikTok data" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

module.exports = app;

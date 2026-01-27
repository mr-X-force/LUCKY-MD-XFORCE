const { ezra } = require("../fredi/ezra");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre } = require(__dirname + "/../fredi/context");

// Initialize Catbox
const catbox = new Catbox();

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363313124070136@newsletter",
    newsletterName: "Fredi AI CEO",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: conf.BOT || 'YouTube Downloader',
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Function to upload a file to Catbox and return the URL
async function uploadToCatbox(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult || null;
  } catch (error) {
    console.error('Catbox upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Common function for YouTube search
async function searchYouTube(query) {
  try {
    const searchResults = await ytSearch(query);
    if (!searchResults?.videos?.length) {
      throw new Error('No video found for the specified query.');
    }
    return searchResults.videos[0];
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error(`YouTube search failed: ${error.message}`);
  }
}

// Common function for downloading media from APIs
async function downloadFromApis(apis) {
  for (const api of apis) {
    try {
      const response = await axios.get(api, { timeout: 15000 });
      if (response.data?.success || response.data?.status === 'success' || response.data?.url) {
        return response.data;
      }
    } catch (error) {
      console.warn(`API ${api} failed:`, error.message);
      continue;
    }
  }
  throw new Error('Failed to retrieve download URL from all sources.');
}

// Audio download command with new API endpoints
ezra({
  nomCom: "play",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "Fredi-Download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a song name.");
    }

    const query = arg.join(" ");
    const video = await searchYouTube(query);
    
    await zk.sendMessage(dest, {
      text: "⬇️ Downloading audio... This may take a moment...",
      contextInfo: getContextInfo("Downloading", userJid, video.thumbnail)
    }, { quoted: ms });

    // Using new API endpoints for audio
    const apis = [
      `https://api.ootaizumi.web.id/downloader/youtube/v2?url=${encodeURIComponent(video.url)}&type=audio`,
      `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(video.url)}&type=audio`,
      `https://api.ootaizumi.web.id/downloader/youtube/play?query=${encodeURIComponent(query)}&type=audio`
    ];

    const downloadData = await downloadFromApis(apis);
    
    // Handle different API response formats
    let downloadUrl, title;
    if (downloadData.url) {
      downloadUrl = downloadData.url;
      title = video.title || "Audio Track";
    } else if (downloadData.result?.url) {
      downloadUrl = downloadData.result.url;
      title = downloadData.result.title || video.title;
    } else if (downloadData.download_url) {
      downloadUrl = downloadData.download_url;
      title = downloadData.title || video.title;
    } else {
      throw new Error('Invalid API response format');
    }

    const messagePayloads = [
      {
        audio: { url: downloadUrl },
        mimetype: 'audio/mp4',
        caption: `🎵 *${title}*`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      },
      {
        document: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${title}* (Document)`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      }
    ];

    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Audio download error:', error);
    repondre(zk, dest, ms, `Download failed: ${error.message}`);
  }
});

// Video download command with new API endpoints
ezra({
  nomCom: "video",
  aliases: ["videodoc", "film", "mp4"],
  categorie: "Fredi-Download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a video name.");
    }

    const query = arg.join(" ");
    const video = await searchYouTube(query);
    
    await zk.sendMessage(dest, {
      text: "⬇️ Downloading video... This may take a moment...",
      contextInfo: getContextInfo("Downloading", userJid, video.thumbnail)
    }, { quoted: ms });

    // Using new API endpoints for video
    const apis = [
      `https://api.ootaizumi.web.id/downloader/youtube/v2?url=${encodeURIComponent(video.url)}&type=video`,
      `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(video.url)}&type=video`,
      `https://api.ootaizumi.web.id/downloader/youtube/play?query=${encodeURIComponent(query)}&type=video`
    ];

    const downloadData = await downloadFromApis(apis);
    
    // Handle different API response formats
    let downloadUrl, title;
    if (downloadData.url) {
      downloadUrl = downloadData.url;
      title = video.title || "Video";
    } else if (downloadData.result?.url) {
      downloadUrl = downloadData.result.url;
      title = downloadData.result.title || video.title;
    } else if (downloadData.download_url) {
      downloadUrl = downloadData.download_url;
      title = downloadData.title || video.title;
    } else {
      throw new Error('Invalid API response format');
    }

    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `🎥 *${title}*`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${title}* (Document)`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      }
    ];

    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Video download error:', error);
    repondre(zk, dest, ms, `Download failed: ${error.message}`);
  }
});

// Direct search and download command using the /play endpoint
ezra({
  nomCom: "ytsearch",
  aliases: ["youtube", "yt"],
  categorie: "Fredi-Download",
  reaction: "🔍"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a search query.");
    }

    const query = arg.join(" ");
    
    await zk.sendMessage(dest, {
      text: "🔍 Searching YouTube...",
      contextInfo: getContextInfo("Searching", userJid)
    }, { quoted: ms });

    // Direct search using the /play endpoint
    const apiUrl = `https://api.ootaizumi.web.id/downloader/youtube/play?query=${encodeURIComponent(query)}`;
    
    const response = await axios.get(apiUrl, { timeout: 15000 });
    
    if (!response.data || (!response.data.url && !response.data.result?.url)) {
      throw new Error('No results found or invalid API response');
    }

    // Handle response format
    let downloadData;
    if (response.data.result) {
      downloadData = response.data;
    } else {
      downloadData = response.data;
    }

    let downloadUrl, title, thumbnail;
    
    if (downloadData.result?.url) {
      downloadUrl = downloadData.result.url;
      title = downloadData.result.title || query;
      thumbnail = downloadData.result.thumbnail || '';
    } else if (downloadData.url) {
      downloadUrl = downloadData.url;
      title = downloadData.title || query;
      thumbnail = downloadData.thumbnail || '';
    } else {
      downloadUrl = downloadData.download_url || downloadData.url;
      title = downloadData.title || query;
      thumbnail = downloadData.thumbnail || '';
    }

    // Check if it's audio or video based on file extension or API response
    const isAudio = downloadUrl.includes('.mp3') || (downloadData.type === 'audio');
    
    const messagePayload = isAudio ? {
      audio: { url: downloadUrl },
      mimetype: 'audio/mp4',
      caption: `🎵 *${title}*`,
      contextInfo: getContextInfo(title, userJid, thumbnail)
    } : {
      video: { url: downloadUrl },
      mimetype: 'video/mp4',
      caption: `🎥 *${title}*`,
      contextInfo: getContextInfo(title, userJid, thumbnail)
    };

    await zk.sendMessage(dest, messagePayload, { quoted: ms });

  } catch (error) {
    console.error('YouTube search error:', error);
    repondre(zk, dest, ms, `Search failed: ${error.message}`);
  }
});

// URL upload command (unchanged, but kept for completeness)
ezra({
  nomCom: 'url-link',
  categorie: "Fredi-Download",
  reaction: '👨🏿‍💻'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, userJid, ms } = commandOptions;

  try {
    if (!msgRepondu) {
      return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
    }

    const mediaTypes = [
      'videoMessage', 'gifMessage', 'stickerMessage',
      'documentMessage', 'imageMessage', 'audioMessage'
    ];

    const mediaType = mediaTypes.find(type => msgRepondu[type]);
    if (!mediaType) {
      return repondre(zk, dest, ms, "Unsupported media type.");
    }

    const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu[mediaType]);
    const fileUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath);

    await zk.sendMessage(dest, {
      text: `✅ Here's your file URL:\n${fileUrl}`,
      contextInfo: getContextInfo("Upload Complete", userJid)
    });

  } catch (error) {
    console.error("Upload error:", error);
    repondre(zk, dest, ms, `Upload failed: ${error.message}`);
  }
});
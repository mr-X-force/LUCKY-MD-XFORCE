const { ezra } = require("../fredi/ezra");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { repondre } = require(__dirname + "/../fredi/context");

// Store user sessions for media selection
const userSessions = new Map();

// Newsletter context configuration[citation:1]
const getNewsletterContext = (title = '', userJid = '', thumbnailUrl = '', sourceUrl = '') => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363313124070136@newsletter",
    newsletterName: "@FrediEzra",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttributed: true,
    title: conf.BOT || 'YouTube Downloader',
    body: title || "Media Downloader",
    thumbnailUrl: thumbnailUrl || conf.URL || '',
    sourceUrl: sourceUrl || conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Main download command - single command for all downloads
ezra({
  nomCom: "download",
  aliases: ["dl", "yt", "ytdl", "youtube"],
  categorie: "Yt Dowloader",
  reaction: "📥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre, userJid, prefixe } = commandOptions;

  // Check if user is selecting from options
  if (arg[0] && !isNaN(arg[0]) && userSessions.has(dest)) {
    return handleUserSelection(dest, zk, commandOptions);
  }

  // Check if a query is provided
  if (!arg[0]) {
    return repondre(`📥 *YouTube Downloader*\n\nUse: ${prefixe}download [video name/link]\n\nExample:\n${prefixe}download Adele Hello\n${prefixe}download https://youtube.com/watch?v=...`);
  }

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    // Check if it's a YouTube URL[citation:2]
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      // Perform a YouTube search
      const searchResults = await ytSearch(query);
      if (!searchResults?.videos?.length) {
        return repondre('⚠️ No video found. Try a different search term.');
      }
      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url; // Changed from .info to .url
    }

    if (!videoInfo) {
      return repondre('⚠️ Failed to retrieve video information.');
    }

    // Save video info in session
    userSessions.set(dest, {
      videoUrl,
      videoInfo,
      timestamp: Date.now()
    });

    // Show media selection menu
    const menuText = `
🎬 *${videoInfo.title.substring(0, 60)}${videoInfo.title.length > 60 ? '...' : ''}*

⏱️ Duration: ${videoInfo.duration.timestamp || 'Unknown'}
👁️ Views: ${videoInfo.views.toLocaleString()}
📅 Uploaded: ${videoInfo.ago}

📥 *Choose the type of media you want:*

1️⃣ 🎵 *Audio (MP3)* - Playable music message
2️⃣ 📁 *Audio Document* - MP3 file
3️⃣ 🎬 *Video (MP4)* - Standard video
4️⃣ 📁 *Video Document* - MP4 file
5️⃣ 🎬 *HD Video* - High-quality video
6️⃣ 🎵 *High Quality Audio* - Better quality audio

*Reply with a number (1-6)*

📌 *Instructions:* 
- Use numbers 1-6 to choose
- Or use "${prefixe}download [number]" 
- Videos larger than 15MB will be sent as a document
`.trim();

    await zk.sendMessage(dest, {
      text: menuText,
      contextInfo: getNewsletterContext(
        "YouTube Downloader",
        userJid,
        videoInfo.thumbnail,
        videoUrl
      )
    }, { quoted: ms });

  } catch (error) {
    console.error('Search error:', error);[citation:4]
    repondre(`⚠️ Error: ${error.message || error}`);
  }
});

// Function to handle user selection
async function handleUserSelection(dest, zk, commandOptions) {
  const { arg, ms, repondre, userJid } = commandOptions;
  const selection = parseInt(arg[0]);

  if (selection < 1 || selection > 6) {
    return repondre('⚠️ Please choose a number between 1 and 6.');
  }

  const session = userSessions.get(dest);
  if (!session) {
    return repondre('⚠️ Session expired. Please start over.');
  }

  // Clear old sessions after 10 minutes
  if (Date.now() - session.timestamp > 10 * 60 * 1000) {
    userSessions.delete(dest);
    return repondre('⚠️ Session expired. Please start over.');
  }

  const { videoUrl, videoInfo } = session;

  try {
    // Send processing message
    const processingText = `⏳ Downloading...\n\n🎬 *${videoInfo.title.substring(0, 50)}...*\n📊 Processing...`;
    
    await zk.sendMessage(dest, {
      text: processingText,
      contextInfo: getNewsletterContext(
        "Downloading...",
        userJid,
        videoInfo.thumbnail,
        videoUrl
      )
    }, { quoted: ms });

    let downloadUrl;
    let qualityInfo = "";
    let isDocument = false;
    let mediaType = "";

    // Handle different selection types
    switch (selection) {
      case 1: // Audio (MP3)
      case 2: // Audio Document
      case 6: // High Quality Audio
        isDocument = (selection === 2);
        mediaType = "audio";
        downloadUrl = await getAudioDownloadUrl(videoUrl, selection === 6);
        break;

      case 3: // Video (MP4)
      case 4: // Video Document
      case 5: // HD Video
        isDocument = (selection === 4);
        mediaType = "video";
        const hdRequested = (selection === 5);
        const result = await getVideoDownloadUrl(videoUrl, hdRequested);
        downloadUrl = result.url;
        qualityInfo = result.quality;
        break;
    }

    if (!downloadUrl) {
      throw new Error("Could not get download link.");
    }

    // Prepare message based on selection
    const newsletterContext = getNewsletterContext(
      videoInfo.title.substring(0, 50),
      userJid,
      videoInfo.thumbnail,
      videoUrl
    );

    // Send the media
    await sendMedia(dest, zk, ms, {
      mediaType,
      isDocument,
      downloadUrl,
      title: videoInfo.title,
      qualityInfo,
      contextInfo: newsletterContext
    });

    // Clear session after successful download
    userSessions.delete(dest);

  } catch (error) {
    console.error('Download error:', error);[citation:6]
    repondre(`⚠️ Failed to download: ${error.message || error}`);[citation:7]
  }
}

// Function to get audio download URL
async function getAudioDownloadUrl(videoUrl, highQuality = false) {
  const audioApis = [
    `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
    `https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
    `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`
  ];

  for (const api of audioApis) {
    try {
      const response = await axios.get(api, { timeout: 20000 });
      const data = response.data;

      if (data && (data.status === true || data.success === true)) {
        if (data.download_url) return data.download_url;
        if (data.url) return data.url;
        if (data.result?.url) return data.result.url;
        if (data.result?.downloadUrl) return data.result.downloadUrl;
        if (data.data?.downloadUrl) return data.data.downloadUrl;
      }
    } catch (error) {
      console.warn(`Audio API failed: ${api}`, error.message);
      continue;
    }
  }
  throw new Error("Could not get audio from all sources.");
}

// Function to get video download URL
async function getVideoDownloadUrl(videoUrl, hdRequested = false) {
  const videoApis = [
    `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
    `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}`,
    `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
    `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
  ];

  for (const api of videoApis) {
    try {
      const response = await axios.get(api, { timeout: 25000 });
      const data = response.data;

      if (data && (data.status === true || data.success === true)) {
        let url, quality = "";
        
        if (data.download_url) {
          url = data.download_url;
          quality = data.quality || data.resolution || "";
        } else if (data.url) {
          url = data.url;
        } else if (data.result?.url) {
          url = data.result.url;
          quality = data.result.quality || "";
        } else if (data.result?.downloadUrl) {
          url = data.result.downloadUrl;
          quality = data.result.quality || "";
        } else if (data.data?.downloadUrl) {
          url = data.data.downloadUrl;
          quality = data.data.quality || "";
        } else if (data.videoUrl) {
          url = data.videoUrl;
          quality = data.quality || "";
        }

        if (url) {
          // If HD requested but not provided, continue searching
          if (hdRequested && (!quality || !quality.includes('720') || !quality.includes('1080'))) {
            continue;
          }
          return { url, quality };
        }
      }
    } catch (error) {
      console.warn(`Video API failed: ${api}`, error.message);[citation:4]
      continue;
    }
  }
  
  // If HD not found but normal quality exists, return last found
  if (!hdRequested) {
    throw new Error("Could not get video from all sources.");
  } else {
    throw new Error("HD video not available. Try standard video.");
  }
}

// Function to send media
async function sendMedia(dest, zk, ms, options) {
  const { mediaType, isDocument, downloadUrl, title, qualityInfo, contextInfo } = options;

  const safeFileName = `${title.replace(/[^\w\s.-]/gi, '')}`.substring(0, 80);

  if (isDocument) {
    const documentPayload = {
      document: { url: downloadUrl },
      mimetype: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
      fileName: `${safeFileName}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`,
      caption: `📁 ${mediaType === 'audio' ? '🎵' : '🎬'} *${title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}\n\n🔗 Sent by @FrediEzra`,
      contextInfo: contextInfo
    };
    await zk.sendMessage(dest, documentPayload, { quoted: ms });

  } else {
    if (mediaType === 'audio') {
      const audioPayload = {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        caption: `🎵 *${title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}\n\n🔗 Sent by @FrediEzra`,
        contextInfo: contextInfo
      };
      await zk.sendMessage(dest, audioPayload, { quoted: ms });

    } else if (mediaType === 'video') {
      const videoPayload = {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `🎬 *${title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}\n\n🔗 Sent by @FrediEzra`,
        contextInfo: contextInfo
      };
      await zk.sendMessage(dest, videoPayload, { quoted: ms });
    }
  }

  // Send success message
  const successEmoji = mediaType === 'audio' ? '🎵' : '🎬';
  const typeText = isDocument ? 'document file' : 'message';
  await repondre(`${successEmoji} Success! ${mediaType === 'audio' ? 'Audio' : 'Video'} sent as ${typeText}.${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}`);
}

// Clean up old sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [dest, session] of userSessions.entries()) {
    if (now - session.timestamp > 10 * 60 * 1000) {
      userSessions.delete(dest);
    }
  }
}, 60 * 60 * 1000);

console.log('✅ YouTube Downloader command loaded with interactive menu system!');
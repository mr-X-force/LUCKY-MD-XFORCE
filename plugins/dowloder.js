const { ezra } = require("../fredi/ezra");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { repondre } = require(__dirname + "/../fredi/context");

// Store user sessions for media selection
const userSessions = new Map();

// Newsletter context configuration
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

// Function to handle user selection
async function handleUserSelection(dest, zk, commandOptions) {
  const { arg, ms, repondre, userJid } = commandOptions;
  const selection = parseInt(arg[0]);

  if (selection < 1 || selection > 6) {
    return repondre('⚠️ Please choose a number between 1 and 6.');
  }

  const session = userSessions.get(dest);
  if (!session) {
    return repondre('⚠️ Session expired. Please start over with !download again.');
  }

  // Clear old sessions after 10 minutes
  if (Date.now() - session.timestamp > 10 * 60 * 1000) {
    userSessions.delete(dest);
    return repondre('⚠️ Session expired. Please start over with !download again.');
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
    let filename = "";

    // Handle different selection types
    switch (selection) {
      case 1: // Audio (MP3)
        isDocument = false;
        mediaType = "audio";
        filename = "audio.mp3";
        downloadUrl = await getAudioDownloadUrl(videoUrl, false);
        break;

      case 2: // Audio Document
        isDocument = true;
        mediaType = "audio";
        filename = `${videoInfo.title.replace(/[^\w\s.-]/gi, '')}.mp3`.substring(0, 80);
        downloadUrl = await getAudioDownloadUrl(videoUrl, false);
        break;

      case 3: // Video (MP4)
        isDocument = false;
        mediaType = "video";
        filename = "video.mp4";
        const videoResult1 = await getVideoDownloadUrl(videoUrl, false);
        downloadUrl = videoResult1.url;
        qualityInfo = videoResult1.quality;
        break;

      case 4: // Video Document
        isDocument = true;
        mediaType = "video";
        filename = `${videoInfo.title.replace(/[^\w\s.-]/gi, '')}.mp4`.substring(0, 80);
        const videoResult2 = await getVideoDownloadUrl(videoUrl, false);
        downloadUrl = videoResult2.url;
        qualityInfo = videoResult2.quality;
        break;

      case 5: // HD Video
        isDocument = false;
        mediaType = "video";
        filename = "video_hd.mp4";
        const hdResult = await getVideoDownloadUrl(videoUrl, true);
        downloadUrl = hdResult.url;
        qualityInfo = hdResult.quality || "HD";
        break;

      case 6: // High Quality Audio
        isDocument = false;
        mediaType = "audio";
        filename = "hq_audio.mp3";
        downloadUrl = await getAudioDownloadUrl(videoUrl, true);
        qualityInfo = "High Quality";
        break;
    }

    if (!downloadUrl) {
      throw new Error("Could not get download link from any API.");
    }

    console.log(`Download URL obtained: ${downloadUrl.substring(0, 100)}...`);

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
      contextInfo: newsletterContext,
      filename
    });

    // Clear session after successful download
    userSessions.delete(dest);

  } catch (error) {
    console.error('Download error:', error);
    repondre(`⚠️ Failed to download: ${error.message || error}`);
    // Don't delete session on error so user can retry
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
      console.log(`Trying audio API: ${api}`);
      const response = await axios.get(api, { 
        timeout: 25000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const data = response.data;
      console.log(`Audio API response status: ${data?.status || data?.success}`);

      if (data && (data.status === true || data.success === true || data.download_url || data.url)) {
        if (data.download_url) {
          console.log(`Found download_url: ${data.download_url.substring(0, 100)}...`);
          return data.download_url;
        }
        if (data.url) {
          console.log(`Found url: ${data.url.substring(0, 100)}...`);
          return data.url;
        }
        if (data.result?.url) {
          console.log(`Found result.url: ${data.result.url.substring(0, 100)}...`);
          return data.result.url;
        }
        if (data.result?.downloadUrl) {
          console.log(`Found result.downloadUrl: ${data.result.downloadUrl.substring(0, 100)}...`);
          return data.result.downloadUrl;
        }
        if (data.data?.downloadUrl) {
          console.log(`Found data.downloadUrl: ${data.data.downloadUrl.substring(0, 100)}...`);
          return data.data.downloadUrl;
        }
        if (data.result) {
          // Some APIs return result as string directly
          console.log(`Found result as string: ${data.result.substring(0, 100)}...`);
          return data.result;
        }
      }
    } catch (error) {
      console.warn(`Audio API ${api} failed:`, error.message);
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
      console.log(`Trying video API: ${api}`);
      const response = await axios.get(api, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const data = response.data;
      console.log(`Video API response status: ${data?.status || data?.success}`);

      if (data && (data.status === true || data.success === true || data.download_url || data.url)) {
        let url = "";
        let quality = "";
        
        if (data.download_url) {
          url = data.download_url;
          quality = data.quality || data.resolution || "";
        } else if (data.url) {
          url = data.url;
          quality = data.quality || "";
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
        } else if (data.result) {
          // Some APIs return result as string directly
          url = data.result;
          quality = "Standard";
        }

        if (url) {
          console.log(`Found video URL: ${url.substring(0, 100)}..., Quality: ${quality}`);
          
          // If HD requested but not provided, continue searching
          if (hdRequested) {
            const qualityLower = quality.toLowerCase();
            if (qualityLower.includes('720') || qualityLower.includes('1080') || qualityLower.includes('hd')) {
              return { url, quality };
            } else {
              console.log(`HD not found in ${quality}, continuing search...`);
              continue;
            }
          }
          return { url, quality };
        }
      }
    } catch (error) {
      console.warn(`Video API ${api} failed:`, error.message);
      continue;
    }
  }
  
  if (!hdRequested) {
    throw new Error("Could not get video from all sources.");
  } else {
    throw new Error("HD video not available. Try standard video.");
  }
}

// Function to send media
async function sendMedia(dest, zk, ms, options) {
  const { mediaType, isDocument, downloadUrl, title, qualityInfo, contextInfo, filename } = options;

  const safeFileName = filename || `${title.replace(/[^\w\s.-]/gi, '')}`.substring(0, 80);

  console.log(`Sending ${mediaType} as ${isDocument ? 'document' : 'message'}: ${downloadUrl.substring(0, 100)}...`);

  try {
    if (isDocument) {
      const documentPayload = {
        document: { url: downloadUrl },
        mimetype: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
        fileName: safeFileName,
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
    
    await zk.sendMessage(dest, { 
      text: `${successEmoji} Success! ${mediaType === 'audio' ? 'Audio' : 'Video'} sent as ${typeText}.${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}` 
    }, { quoted: ms });

    console.log(`✅ Media sent successfully to ${dest}`);

  } catch (error) {
    console.error('Error sending media:', error);
    throw error;
  }
}

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
    console.log(`Processing selection ${arg[0]} for ${dest}`);
    return handleUserSelection(dest, zk, commandOptions);
  }

  // Check if a query is provided
  if (!arg[0]) {
    const helpText = `📥 *Lucky-Xforce Downloader*\n\nUse: ${prefixe}download [video name/link]\n\nExample:\n${prefixe}download Adele Hello\n${prefixe}download https://youtube.com/watch?v=...`;
    return repondre(helpText);
  }

  let videoUrl, videoInfo;
  const query = arg.join(" ");

  try {
    console.log(`Searching for: ${query}`);
    
    // Check if it's a YouTube URL
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      console.log(`YouTube URL detected, Video ID: ${videoId}`);
      videoInfo = await ytSearch({ videoId });
    } else {
      // Perform a YouTube search
      console.log(`Searching YouTube for: ${query}`);
      const searchResults = await ytSearch(query);
      if (!searchResults || !searchResults.videos || !searchResults.videos.length) {
        return repondre('⚠️ No video found. Try a different search term.');
      }
      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }

    if (!videoInfo) {
      return repondre('⚠️ Failed to retrieve video information.');
    }

    console.log(`Found video: ${videoInfo.title}, URL: ${videoUrl}`);

    // Save video info in session
    userSessions.set(dest, {
      videoUrl,
      videoInfo,
      timestamp: Date.now()
    });

    // Show media selection menu
    const menuText = `
🎬 *${videoInfo.title.substring(0, 60)}${videoInfo.title.length > 60 ? '...' : ''}*

⏱️ Duration: ${videoInfo.duration?.timestamp || 'Unknown'}
👁️ Views: ${videoInfo.views ? videoInfo.views.toLocaleString() : 'Unknown'}
📅 Uploaded: ${videoInfo.ago || 'Unknown'}

📥 *Choose the type of media you want:*

1️⃣ 🎵 *Audio (MP3)* - Playable music message
2️⃣ 📁 *Audio Document* - MP3 file
3️⃣ 🎬 *Video (MP4)* - Standard video
4️⃣ 📁 *Video Document* - MP4 file
5️⃣ 🎬 *HD Video* - High-quality video
6️⃣ 🎵 *High Quality Audio* - Better quality audio

*Reply with a number (1-6)*

📌 *Instructions:* 
- Use: *${prefixe}download [number]* (Example: *${prefixe}download 1*)
- Or just type the number in reply
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

    console.log(`Menu sent to ${dest}, session saved`);

  } catch (error) {
    console.error('Search error:', error);
    repondre(`⚠️ Error: ${error.message || error}`);
  }
});

// ========== IMPORTANT: ADD MESSAGE EVENT LISTENER ==========
// This handles when users reply with just a number

// Store bot's JID for reply detection
let botJid = null;

// Initialize when bot starts
ezra({
  nomCom: "init",
  categorie: "System",
  reaction: "⚙️"
}, async (dest, zk) => {
  botJid = zk.user.id;
  console.log(`Bot JID set: ${botJid}`);
});

// Listen for number-only messages (replies to menu)
if (typeof zk !== 'undefined' && zk.ev) {
  zk.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return; // Ignore bot's own messages

      const messageText = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption ||
                         "";

      // Check if it's a number between 1-6
      if (/^[1-6]$/.test(messageText.trim())) {
        const dest = msg.key.remoteJid;
        const selection = parseInt(messageText.trim());
        
        console.log(`Detected number selection ${selection} from ${dest}`);
        
        // Check if user has an active session
        if (userSessions.has(dest)) {
          const session = userSessions.get(dest);
          
          // Create a mock commandOptions object
          const commandOptions = {
            arg: [selection.toString()],
            ms: msg,
            repondre: (text) => zk.sendMessage(dest, { text }, { quoted: msg }),
            userJid: msg.key.participant || msg.key.remoteJid,
            prefixe: "!" // Default prefix, adjust if needed
          };
          
          console.log(`Processing selection ${selection} for ${dest}`);
          await handleUserSelection(dest, zk, commandOptions);
        }
      }
    } catch (error) {
      console.error('Error in message listener:', error);
    }
  });
}

// Clean up old sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [dest, session] of userSessions.entries()) {
    if (now - session.timestamp > 10 * 60 * 1000) {
      userSessions.delete(dest);
      console.log(`Cleared expired session for ${dest}`);
    }
  }
}, 60 * 60 * 1000);

console.log('✅ YouTube Downloader command loaded with interactive menu system!');
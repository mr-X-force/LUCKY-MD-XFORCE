const { ezra } = require("../fredi/ezra");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { repondre } = require(__dirname + "/../fredi/context");

// Store user sessions for 10 minutes
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

// ========== WORKING API FUNCTIONS ==========

async function getAudioDownloadUrl(videoUrl) {
  // Try reliable APIs in order
  const audioApis = [
    `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(videoUrl)}`,
    `https://api-rin-tohsaka.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
  ];

  for (const api of audioApis) {
    try {
      console.log(`Trying audio API: ${api}`);
      const response = await axios.get(api, { timeout: 15000 });
      const data = response.data;
      
      if (data) {
        // Check different response formats
        if (data.download_url) return data.download_url;
        if (data.url) return data.url;
        if (data.result?.url) return data.result.url;
        if (data.result?.downloadUrl) return data.result.downloadUrl;
        if (typeof data.result === 'string' && data.result.startsWith('http')) return data.result;
      }
    } catch (error) {
      console.log(`API failed: ${error.message}`);
      continue;
    }
  }
  
  // Fallback to local converter
  throw new Error("Audio API not available. Try again later.");
}

async function getVideoDownloadUrl(videoUrl) {
  // Try reliable APIs in order
  const videoApis = [
    `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`,
    `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`
  ];

  for (const api of videoApis) {
    try {
      console.log(`Trying video API: ${api}`);
      const response = await axios.get(api, { timeout: 20000 });
      const data = response.data;
      
      if (data) {
        let url = '';
        let quality = 'Standard';
        
        if (data.download_url) url = data.download_url;
        else if (data.url) url = data.url;
        else if (data.result?.url) url = data.result.url;
        else if (data.result?.downloadUrl) url = data.result.downloadUrl;
        else if (data.videoUrl) url = data.videoUrl;
        else if (typeof data.result === 'string' && data.result.startsWith('http')) url = data.result;
        
        if (url) {
          if (data.quality) quality = data.quality;
          else if (data.result?.quality) quality = data.result.quality;
          return { url, quality };
        }
      }
    } catch (error) {
      console.log(`API failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error("Video API not available. Try again later.");
}

// ========== MAIN DOWNLOAD COMMAND ==========
ezra({
  nomCom: "download",
  aliases: ["dl", "yt", "ytdl", "youtube"],
  categorie: "Yt Dowloader",
  reaction: "📥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre, userJid, prefixe } = commandOptions;

  // ===== PART 1: Handle number selection (1-6) =====
  if (arg[0] && !isNaN(arg[0])) {
    const selection = parseInt(arg[0]);
    
    if (selection < 1 || selection > 6) {
      return repondre('Please choose a number between 1 and 6.');
    }
    
    // Get session for this user
    const session = userSessions.get(dest);
    if (!session) {
      return repondre('No video selected. First use: *!download [video name]*');
    }
    
    // Check if session expired (10 minutes)
    if (Date.now() - session.timestamp > 10 * 60 * 1000) {
      userSessions.delete(dest);
      return repondre('Session expired. Start over with: *!download [video name]*');
    }
    
    const { videoUrl, videoInfo } = session;
    
    try {
      // Send processing message
      await repondre(`Processing selection ${selection}...\nTitle: *${videoInfo.title.substring(0, 50)}...*`);
      
      let downloadUrl, qualityInfo = "", mediaType, isDocument, fileName;
      
      // Handle selection
      switch(selection) {
        case 1: // Audio message
          mediaType = "audio";
          isDocument = false;
          downloadUrl = await getAudioDownloadUrl(videoUrl);
          break;
          
        case 2: // Audio document
          mediaType = "audio";
          isDocument = true;
          downloadUrl = await getAudioDownloadUrl(videoUrl);
          fileName = `${videoInfo.title.replace(/[^\w\s.-]/gi, '')}.mp3`.substring(0, 80);
          break;
          
        case 3: // Video message
          mediaType = "video";
          isDocument = false;
          const videoResult1 = await getVideoDownloadUrl(videoUrl);
          downloadUrl = videoResult1.url;
          qualityInfo = videoResult1.quality;
          break;
          
        case 4: // Video document
          mediaType = "video";
          isDocument = true;
          const videoResult2 = await getVideoDownloadUrl(videoUrl);
          downloadUrl = videoResult2.url;
          qualityInfo = videoResult2.quality;
          fileName = `${videoInfo.title.replace(/[^\w\s.-]/gi, '')}.mp4`.substring(0, 80);
          break;
          
        case 5: // HD Video
          mediaType = "video";
          isDocument = false;
          const hdResult = await getVideoDownloadUrl(videoUrl);
          downloadUrl = hdResult.url;
          qualityInfo = hdResult.quality + " (HD)";
          break;
          
        case 6: // HQ Audio
          mediaType = "audio";
          isDocument = false;
          downloadUrl = await getAudioDownloadUrl(videoUrl);
          qualityInfo = "High Quality";
          break;
      }
      
      if (!downloadUrl) {
        throw new Error("Could not get download link.");
      }
      
      console.log(`Download URL: ${downloadUrl}`);
      
      // Send the media with newsletter context
      const contextInfo = getNewsletterContext(
        videoInfo.title.substring(0, 50),
        userJid,
        videoInfo.thumbnail,
        videoUrl
      );
      
      if (isDocument) {
        await zk.sendMessage(dest, {
          document: { url: downloadUrl },
          mimetype: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
          fileName: fileName || `${mediaType}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`,
          caption: `📁 ${mediaType === 'audio' ? '🎵' : '🎬'} *${videoInfo.title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}`,
          contextInfo: contextInfo
        }, { quoted: ms });
      } else {
        if (mediaType === 'audio') {
          await zk.sendMessage(dest, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            caption: `🎵 *${videoInfo.title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}`,
            contextInfo: contextInfo
          }, { quoted: ms });
        } else {
          await zk.sendMessage(dest, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            caption: `🎬 *${videoInfo.title.substring(0, 50)}*${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}`,
            contextInfo: contextInfo
          }, { quoted: ms });
        }
      }
      
      // Send success message
      await repondre(`✅ ${mediaType === 'audio' ? 'Audio' : 'Video'} sent!${qualityInfo ? `\n📊 Quality: ${qualityInfo}` : ''}`);
      
      // Clear session
      userSessions.delete(dest);
      
    } catch (error) {
      console.error('Download error:', error);
      await repondre(`Error: ${error.message}`);
    }
    
    return;
  }
  
  // ===== PART 2: Handle search query =====
  if (!arg[0]) {
    return repondre(`📥 *YouTube Downloader*\n\nUse: ${prefixe}download [video name/link]\n\nExample:\n${prefixe}download Adele Hello\n${prefixe}download https://youtube.com/...`);
  }
  
  const query = arg.join(" ");
  
  try {
    console.log(`Searching for: ${query}`);
    
    let videoUrl, videoInfo;
    
    // Check if YouTube URL
    if (query.match(/(youtube\.com|youtu\.be)/i)) {
      videoUrl = query;
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      videoInfo = await ytSearch({ videoId });
    } else {
      // Search YouTube
      const searchResults = await ytSearch(query);
      if (!searchResults?.videos?.length) {
        return repondre('No video found. Try different keywords.');
      }
      videoInfo = searchResults.videos[0];
      videoUrl = videoInfo.url;
    }
    
    if (!videoInfo) {
      return repondre('Failed to get video information.');
    }
    
    // Save to session
    userSessions.set(dest, {
      videoUrl,
      videoInfo,
      timestamp: Date.now()
    });
    
    console.log(`Video found: ${videoInfo.title}`);
    
    // Show menu
    const menuText = `
🎬 *${videoInfo.title.substring(0, 60)}${videoInfo.title.length > 60 ? '...' : ''}*

⏱️ Duration: ${videoInfo.duration?.timestamp || 'Unknown'}
👁️ Views: ${videoInfo.views ? videoInfo.views.toLocaleString() : 'Unknown'}
📅 Uploaded: ${videoInfo.ago || 'Unknown'}

📥 *Choose media type:*

1️⃣ 🎵 *Audio (MP3)* - Playable audio
2️⃣ 📁 *Audio Document* - MP3 file
3️⃣ 🎬 *Video (MP4)* - Standard video
4️⃣ 📁 *Video Document* - MP4 file
5️⃣ 🎬 *HD Video* - High quality
6️⃣ 🎵 *High Quality Audio* - Better audio

📌 *Instructions:* 
Use: *${prefixe}download [number]*
Example: *${prefixe}download 1* for audio
`.trim();
    
    await zk.sendMessage(dest, {
      text: menuText,
      contextInfo: getNewsletterContext("YouTube Downloader", userJid, videoInfo.thumbnail, videoUrl)
    }, { quoted: ms });
    
  } catch (error) {
    console.error('Search error:', error);
    repondre(`Error: ${error.message}`);
  }
});

// ========== MESSAGE LISTENER ==========
// Handle direct number replies (1-6)
if (typeof zk !== 'undefined' && zk.ev) {
  zk.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;
      
      const messageText = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || "";
      
      // Check if it's a number 1-6
      if (/^[1-6]$/.test(messageText.trim())) {
        const dest = msg.key.remoteJid;
        const selection = parseInt(messageText.trim());
        
        console.log(`Detected number ${selection} from ${dest}`);
        
        // Check session
        const session = userSessions.get(dest);
        if (session) {
          // Simulate command call
          const mockCommandOptions = {
            arg: [selection.toString()],
            ms: msg,
            repondre: (text) => zk.sendMessage(dest, { text }, { quoted: msg }),
            userJid: msg.key.participant || dest,
            prefixe: "!"
          };
          
          // Process it
          await zk.sendMessage(dest, { 
            text: `Processing selection ${selection}...` 
          }, { quoted: msg });
          
          // Call the handler directly
          const { videoUrl, videoInfo } = session;
          
          try {
            let downloadUrl, mediaType, isDocument;
            
            if (selection === 1 || selection === 2 || selection === 6) {
              mediaType = "audio";
              isDocument = (selection === 2);
              downloadUrl = await getAudioDownloadUrl(videoUrl);
            } else {
              mediaType = "video";
              isDocument = (selection === 4);
              const result = await getVideoDownloadUrl(videoUrl);
              downloadUrl = result.url;
            }
            
            if (downloadUrl) {
              const contextInfo = getNewsletterContext(
                videoInfo.title.substring(0, 50),
                msg.key.participant || dest,
                videoInfo.thumbnail,
                videoUrl
              );
              
              if (isDocument) {
                await zk.sendMessage(dest, {
                  document: { url: downloadUrl },
                  mimetype: mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4',
                  fileName: `${videoInfo.title.substring(0, 50)}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`,
                  contextInfo: contextInfo
                }, { quoted: msg });
              } else if (mediaType === 'audio') {
                await zk.sendMessage(dest, {
                  audio: { url: downloadUrl },
                  mimetype: 'audio/mpeg',
                  contextInfo: contextInfo
                }, { quoted: msg });
              } else {
                await zk.sendMessage(dest, {
                  video: { url: downloadUrl },
                  mimetype: 'video/mp4',
                  contextInfo: contextInfo
                }, { quoted: msg });
              }
              
              await zk.sendMessage(dest, { 
                text: `✅ ${mediaType === 'audio' ? 'Audio' : 'Video'} sent!` 
              }, { quoted: msg });
              
              userSessions.delete(dest);
            }
          } catch (error) {
            await zk.sendMessage(dest, { 
              text: `Error: ${error.message}` 
            }, { quoted: msg });
          }
        } else {
          await zk.sendMessage(dest, { 
            text: 'No active session. Use *!download [video]* first.' 
          }, { quoted: msg });
        }
      }
    } catch (error) {
      console.error('Listener error:', error);
    }
  });
}

// Clean old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [dest, session] of userSessions.entries()) {
    if (now - session.timestamp > 10 * 60 * 1000) {
      userSessions.delete(dest);
      console.log(`Cleared expired session for ${dest}`);
    }
  }
}, 5 * 60 * 1000);

console.log('✅ YouTube Downloader loaded!');
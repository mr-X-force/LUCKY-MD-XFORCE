'use strict';

const { ezra } = require("../fredi/ezra");
const axios = require('axios');
const moment = require("moment-timezone");
const set = require(__dirname + '/../set');
moment.tz.setDefault('' + set.TIMEZONE);

ezra({
  'nomCom': "ping",
  'categorie': "General-Fredi"
}, async (_0x12a838, _0x2d8d4e, _0x1f0ba4) => {
  let {
    ms: _0x5d2f0c
  } = _0x1f0ba4;
  const {
    time: _0xb5466b,
    date: _0x4c687e
  } = {
    'time': moment().format("HH:mm:ss"),
    'date': moment().format("DD/MM/YYYY")
  };
  const _0x4950ba = Math.floor(Math.random() * 0x64) + 0x1;
  try {
    await _0x2d8d4e.sendMessage(_0x12a838, {
      'audio': {
        'url': "https://files.catbox.moe/se9mii.mp3"
      },
      'mimetype': "audio/mp4",
      'ptt': true,
      'contextInfo': {
        'isForwarded': true,
        'forwardedNewsletterMessageInfo': {
          'newsletterJid': "120363313124070136@newsletter",
          'newsletterName': "@FrediEzra",
          'serverMessageId': 0x8f
        },
        'forwardingScore': 0x3e7,
        'externalAdReply': {
          'title': "LUCKY-MD-XFORCE",
          'body': "⚫ Pong: " + _0x4950ba + "ms\n📅 *Date:* " + _0x4c687e + "\n⏰ *Time:* " + _0xb5466b,
          'thumbnailUrl': "https://files.catbox.moe/uw4l17.jpeg",
          'mediaType': 0x1,
          'renderSmallThumbnail': true
        }
      }
    }, {
      'quoted': _0x5d2f0c
    });
  } catch (_0x1149fe) {
    console.log("❌ Ping Command Error: " + _0x1149fe);
    repondre("❌ Error: " + _0x1149fe);
  }
});

/*
ezra({
  nomCom: "repo",
  categorie: "General-Fredi",
  reaction: "🫧",
  nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
  const { pushname, repondre } = commandeOptions;
  const githubRepo = 'https://api.github.com/repos/mr-X-force/LUCKY-MD-XFORCE';

  try {
    const response = await axios.get(githubRepo);
    const data = response.data;

    const created = moment(data.created_at).format("DD/MM/YYYY");
    const updated = moment(data.updated_at).format("DD/MM/YYYY");

    const gitdata = `> *ɴᴀᴍᴇ:*    ${conf.BOT}\n\n> *sᴛᴀʀs:*  ${data.stargazers_count}\n\n> *ғᴏʀᴋs:*  ${data.forks_count}\n\n> *ᴡᴀᴛᴄʜᴇʀs:*  ${data.watchers}\n\n> *ᴜᴘᴅᴀᴛᴇᴅ:*  ${updated}\n\n> *Repo:* ${data.html_url}\n\n_Powered by FrediEzra Tech Info_`;

    await zk.sendMessage(dest, {
      image: { url: 'https://files.catbox.moe/uw4l17.jpeg' },
      caption: gitdata,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363313124070136@newsletter',
          newsletterName: "@FrediEzra",
          serverMessageId: -1
        },
        forwardingScore: 999,
        externalAdReply: {
          title: "LUCKY MD XFORCE",
          body: "🫧 repo link request 🫧",
          thumbnailUrl: "https://files.catbox.moe/3o37c5.jpeg",
          mediaType: 1,
          sourceUrl: data.html_url || "https://github.com/mr-X-force/LUCKY-MD-XFORCE"
        }
      }
    });

    await zk.sendMessage(dest, {
      audio: { url: "https://files.catbox.moe/j3sp1o.mp3" },
      mimetype: "audio/mp4",
      ptt: true,
      caption: "*🫧 Lucky Xforce repo song 🫧",
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363313124070136@newsletter",
          newsletterName: "@FrediEzra",
          serverMessageId: -1
        }
      }
    });

  } catch (e) {
    console.error("Error fetching data:", e);
    await repondre("❌ Error fetching repository data. Please try again later.");
  }
});
*/




ezra({
  nomCom: "repo",
  categorie: "General-Fredi",
  reaction: "🫧",
  nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  // GitHub repository details - FIXED URL
  const owner = "mr-X-force";
  const repoName = "LUCKY-MD-XFORCE";
  const githubRepo = `https://api.github.com/repos/${owner}/${repoName}`;
  
  console.log(`🔍 Attempting to fetch: ${githubRepo}`);

  try {
    // 1. Add User-Agent header (GitHub API requires this)
    const response = await axios.get(githubRepo, {
      headers: {
        'User-Agent': 'WhatsApp-Bot-FrediEzra',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`✅ GitHub API Status: ${response.status}`);
    
    if (!response.data) {
      throw new Error('GitHub API returned empty data');
    }

    const data = response.data;
    
    // 2. Get configuration - FIX: Check if 'conf' exists
    const botName = (typeof conf !== 'undefined' && conf.BOT) ? conf.BOT : "LUCKY-MD-XFORCE";
    
    // 3. Format dates safely
    let created, updated;
    try {
      created = data.created_at ? moment(data.created_at).format("DD/MM/YYYY") : "N/A";
      updated = data.updated_at ? moment(data.updated_at).format("DD/MM/YYYY") : "N/A";
    } catch (dateError) {
      console.error("Date formatting error:", dateError);
      created = "N/A";
      updated = "N/A";
    }

    // 4. Create repository information
    const gitInfo = `🫧 *${botName} Repository* 🫧\n\n` +
                   `📁 *Name:* ${data.name || repoName}\n` +
                   `✨ *Stars:* ${data.stargazers_count || 0}\n` +
                   `🔱 *Forks:* ${data.forks_count || 0}\n` +
                   `👁️ *Watchers:* ${data.subscribers_count || 0}\n` +
                   `📅 *Created:* ${created}\n` +
                   `🔄 *Updated:* ${updated}\n\n` +
                   `🔗 *URL:* ${data.html_url || `https://github.com/${owner}/${repoName}`}\n\n` +
                   `_Powered by FrediEzra Tech Info_`;

    // 5. Send message with buttons
    const buttonsMessage = {
      text: gitInfo,
      footer: "Choose an action:",
      buttons: [
        {
          buttonId: 'repo_open',
          buttonText: { displayText: '🌐 Open Repo' }
        },
        {
          buttonId: 'star_action',
          buttonText: { displayText: '⭐ Star Repo' }
        },
        {
          buttonId: 'fork_action',
          buttonText: { displayText: '🔱 Fork Repo' }
        }
      ],
      headerType: 1
    };

    console.log("📤 Sending repository info...");
    
    // Send main message
    await zk.sendMessage(dest, buttonsMessage, { quoted: ms });
    
    // 6. Send audio (optional - remove if causing issues)
    try {
      await zk.sendMessage(dest, {
        audio: { url: "https://files.catbox.moe/j3sp1o.mp3" },
        mimetype: "audio/mp4",
        ptt: true,
        caption: "*🫧 Lucky Xforce repo song 🫧"
      });
      console.log("✅ Audio sent successfully");
    } catch (audioError) {
      console.warn("⚠️ Audio not sent:", audioError.message);
      // Continue even if audio fails
    }

    console.log("✅ Repository command completed successfully");

  } catch (error) {
    console.error("❌ FULL ERROR DETAILS:");
    console.error("Message:", error.message);
    
    // Detailed error analysis
    let errorMessage = "❌ Error fetching repository data";
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = "❌ Cannot connect to GitHub. Check your internet connection.";
      console.error("Network error - No internet or DNS issue");
    } 
    else if (error.response) {
      // GitHub API error response
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      
      if (error.response.status === 404) {
        errorMessage = `❌ Repository not found: ${owner}/${repoName}\n` +
                      `Check if the repository exists or is private.`;
      } 
      else if (error.response.status === 403) {
        errorMessage = "❌ GitHub API rate limit exceeded.\n" +
                      "Try again in a few minutes.";
      }
      else if (error.response.status === 500) {
        errorMessage = "❌ GitHub server error. Try again later.";
      }
      else {
        errorMessage = `❌ GitHub API Error: ${error.response.status}`;
      }
    } 
    else if (error.request) {
      // Request was made but no response
      errorMessage = "❌ No response from GitHub API (timeout).\n" +
                    "The server might be down or slow.";
      console.error("Request data:", error.request);
    }
    else if (error.message.includes('timeout')) {
      errorMessage = "❌ Request timeout. GitHub API is slow.\n" +
                    "Try again in a moment.";
    }
    else {
      // Other errors
      errorMessage = `❌ Unexpected error: ${error.message}`;
    }

    console.error("Final error message to user:", errorMessage);
    
    // Send error message to user
    try {
      await repondre(errorMessage);
      
      // Also send fallback repository link
      await zk.sendMessage(dest, {
        text: `As a fallback, here's the repository link:\n\n` +
              `🔗 https://github.com/${owner}/${repoName}\n\n` +
              `Try the command again in a few minutes.`
      }, { quoted: ms });
    } catch (sendError) {
      console.error("Failed to send error message:", sendError);
    }
  }
});
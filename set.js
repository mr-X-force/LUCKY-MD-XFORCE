const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('set.env'))
    require('dotenv').config({ path: __dirname + '/set.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;
module.exports = { session: process.env.SESSION_ID || 'LUCKY-XFORCE••<=>eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiVU5RNFI1bEJJSVNjRnd3bnZSbXBaMFhSbGN1VGw2T0RjdWFMZW9VeTJGbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiTHh2VUxRZGk1MkhhV25iUE5qN0lqbDRUeFFSWlhMRTRtWSt4YWgvdldpVT0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiIrTjFLNTRrVlRwVDlCNVl0TzBiMGR2K1loYzJSRUozMzE1ektGNkw0L0ZZPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJabUpTTVd1REZkQU85TUtIKzFjUjcyVkJmZVorc0lNVTBiTTMvbm9LdzJNPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjJMa3JSNitqVXBwRmY2ejMxQ3hsREhmMWxBdWlKZ2UxQzEyaytuaUYyR0k9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjBxcVlqL0lPVXpyV3loSGl2S1l4bllEek5JRndGTFNXaVkxTXJPSHk2RFk9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiOFB2RDBBS2ZrYmkzeTE2UkIzeG0vM1lWckliNWVPMTJUakFmWkx2ZmdIST0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiWTlPVVkxakh1d0dma00yTUNpcUJ3c2dCd3dCbW8weXh0T3Z6YmlBSTJBaz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IlZBKzFvaHE1MmdoKy9aZmVUbmFYK2tzVnlNVTFoL3ZyNzE3N0VPSnFZVTNoMllMRmF0OUUzdlpUdFNDdjFPdHBtRTF4eE9VQ3N3dVZHQjlsOFgwUUFRPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6NzYsImFkdlNlY3JldEtleSI6ImRERVZUU2xwWjFoR1ZBdmRHZmhnU3V2cVNLWXpXT0h2bSt6djRYWmtlMkU9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjozMSwiZmlyc3RVbnVwbG9hZGVkUHJlS2V5SWQiOjMxLCJhY2NvdW50U3luY0NvdW50ZXIiOjAsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJkZXZpY2VJZCI6IkR1dEVwMXhGVEUyVEYzXzZtbk9TZVEiLCJwaG9uZUlkIjoiNTMxYzk5MzAtYTRmNS00YjZlLWE4ZDEtZGU0MmU0YTBiYzNhIiwiaWRlbnRpdHlJZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkQ1Wkc4SXFYWW13NlJJMlpMYkpVM0JucEpzMD0ifSwicmVnaXN0ZXJlZCI6dHJ1ZSwiYmFja3VwVG9rZW4iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJYaFozcFZ1Mkc4QWV1b1pDQ3BrUVd3SmxRSVU9In0sInJlZ2lzdHJhdGlvbiI6e30sInBhaXJpbmdDb2RlIjoiRlJFREVaUkEiLCJtZSI6eyJpZCI6IjkxOTA4MjY0MjI5OTo0QHMud2hhdHNhcHAubmV0IiwibmFtZSI6IsaB4bSA4bSE4bSLIMaB4bSHybThtITKnOG0h8qAcyIsImxpZCI6IjEzODE2MTEyODc2MzYwNzo0QGxpZCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDTnZCM3FNREVPK1k1OE1HR0FNZ0FDZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoiUTVVVFREWEt5WVJXalo1N0VNWVFpZlBxdDdTVDcrRzA1RTRhU1Vra0cwRT0iLCJhY2NvdW50U2lnbmF0dXJlIjoiUWFQUDQxazliWkxOYkFLYWlGRUJEUHMvR2dTcDFPaHNxMUUvVFFMMDdLTXB4dnVtcXZqdXpFSUdreGZJeHBGUFQzNGtqRkRMVCtPY3NSaUNyRHo2QWc9PSIsImRldmljZVNpZ25hdHVyZSI6Imh0aEx4aXpTZlY0NFo3MnhtOFMzM3ZqNURlUE1lajBWN2h6SGxxaWpDWi9Zb2xxME80STlvQjBycDhQdFNsNlhESk5sWS94TjFRK28yaC9YL1NKUEFRPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiOTE5MDgyNjQyMjk5OjRAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCVU9WRTB3MXlzbUVWbzJlZXhER0VJbno2cmUwaysvaHRPUk9Ha2xKSkJ0QiJ9fV0sInBsYXRmb3JtIjoic21iYSIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0FJSUJRPT0ifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzUyODEyNjY4LCJsYXN0UHJvcEhhc2giOiIyTUZLUFEiLCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQU1qbyJ9',
    PREFIXE: process.env.PREFIX || "+",
    GITHUB : process.env.GITHUB|| 'https://github.com/mr-X-force/LUCKY-MD-XFORCE',
    OWNER_NAME : process.env.OWNER_NAME || "𝗕𝗔𝗖𝗞 ✘ 𝗕𝗘𝗡𝗖𝗛𝗘𝗥𝗦",
    NUMERO_OWNER : process.env.NUMERO_OWNER || "919082642299",
    DEV : process.env.DEV || "FrediEzra Tz",
              
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "non",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'non',
    AUTO_REACT_HOME: process.env.AUTO_REACT_HOME_MESSAGE || "non",
    AUTO_REACT_AWAY : process.env.AUTO_REACT_AWAY_MESSAGE || "no", 
    AUTO_REACT_GROUP : process.env.AUTO_REACT_GROUP_MESSAGE || "no", 
    AUTO_REACT : process.env.AUTO_REACTION || "no", 
    AUTO_SAVE_CONTACTS : process.env.AUTO_SAVE_CONTACTS || 'no',
    URL: process.env.URL || "https://files.catbox.moe/uw4l17.jpeg",  
    URL2: process.env.URL2 || "https://files.catbox.moe/3o37c5.jpeg",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'non',              
    CHAT_BOT: process.env.CHAT_BOT || "no",              
    AUTO_READ_MESSAGES: process.env.AUTO_READ_MESSAGES || "yes",
    AUTO_BLOCK: process.env.AUTO_BLOCK || 'no', 
    GCF: process.env.GROUP_HANDLE || 'no', 
    GREET_MESSAGE : process.env.GREET_MESSAGE || "no", 
    AUTO_STICKER : process.env.AUTO_STICKER || "no", 
    AUTO_STATUS_TEXT: process.env.AUTO_STATUS_TEXT || 'Your Status Seen By LUCKY-MD-XFORCE',   
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'no',
    AUTO_BIO: process.env.AUTO_BIO || 'yes',       
    ANTI_CALL_TEXT : process.env.ANTI_CALL_TEXT || '',             
    GURL: process.env.GURL  || "https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f",
    WEBSITE :process.env.GURL || "https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f",
    CAPTION : process.env.CAPTION || "LUCKY-MD-XFORCE",
    BOT : process.env.BOT_NAME || 'LUCKY-MD-XFORCE',
    MODE: process.env.PUBLIC_MODE || "no",              
    TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi", 
    PM_PERMIT: process.env.PM_PERMIT || 'no',
    HEROKU_APP_NAME : process.env.HEROKU_APP_NAME || null,
    HEROKU_API_KEY : process.env.HEROKU_API_KEY || null,
    WARN_COUNT : process.env.WARN_COUNT || '5' ,
    ETAT : process.env.PRESENCE || '1',
    DP : process.env.STARTING_BOT_MESSAGE || "yes",
    LUCKY_ADM : process.env.ANTI_DELETE_MESSAGES || 'no',
    ANTI_DELETE_GROUP : process.env.ANTI_DELETE_GROUP || 'no',
    ANTI_CALL: process.env.ANTI_CALL || 'yes', 
    AUTO_REPLY : process.env.AUTO_REPLY || "no", 
    AUDIO_REPLY : process.env.AUDIO_REPLY || 'yes', 
    VOICE_CHATBOT_INBOX : process.env.VOICE_CHATBOT_INBOX || "no",
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9" : "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9",
    /* new Sequelize({
     dialect: 'sqlite',
     storage: DATABASE_URL,
     logging: false,
})
: new Sequelize(DATABASE_URL, 
     dialect: 'postgres',
     ssl: true,
     protocol: 'postgres',
     dialectOptions: {
         native: true,
         ssl: { require: true, rejectUnauthorized: false },
     },
     logging: false,
}),*/
};
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`mise à jour ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});

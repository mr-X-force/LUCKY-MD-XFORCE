const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('set.env'))
    require('dotenv').config({ path: __dirname + '/set.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;
module.exports = { session: process.env.SESSION_ID || 'LUCKY-XFORCE••<=>eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoibU1mNjFzTVhZZ1BHQzNnTnZnRkRiemh4dm0zaldLU1cwRHNyMUNNK20waz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiWWg0cFkrTXEwaTVvR1J1NG9jL1pINndiUHBLVjZpT3c3NWE0OUdKRmNuMD0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJnR0dZZlJ0U1BDMXhaTW94UzdjZ3lpL0FjNTY1K2g5VnJnZDgyalhOcFZzPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJQSHE3OE9SenRIcWRMaElyd09mTUZ2MHVva3I0bSs2YTREbld2bUppclJ3PSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjZOcCtoWXJqZzNGS3BWY0x4RkZ2VzNHV3o3TjY0ZVFlTzg1cDVsUnpCSHM9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImRZc2wxMmpWQU9XMk56bjVCS3lyeDI5aUV1ZFNDQUhmMVkrc2U2WHdyaFE9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiYUVLK2d2ekgxMzkyYlJlRlF5UkpnazVJNjhQRURnVlcyTkpqOG53MGVFST0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoibzhOM1BTMlZWSUJ4L1dvTmtDaGxlS0pTbGhWaGpRWjN6aC9HYldKNE8xdz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImprWStBbTVWYXJUVjNDMlBkOHBLUUFQeXBHVVlsb1YrSWorWm5TUzJUdFdxUklpUFhEUFI0N1Y4VlBZRnRoUEhCOEU5R3lOQUIwZmN2UzlVLzU0ckRRPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTYzLCJhZHZTZWNyZXRLZXkiOiJaZXpsbTgxRE1xY3JlbDQyN1VGN3JnSXk2cUxpbnVSck9WQnlHcW13cm9zPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W3sia2V5Ijp7InJlbW90ZUppZCI6IjUwOTM5MTAzNDY0QHMud2hhdHNhcHAubmV0IiwiZnJvbU1lIjp0cnVlLCJpZCI6IjFBQzIyNUYyMzk0RkVCNzBCNjBFQkU3QThEOEQzOUUyIn0sIm1lc3NhZ2VUaW1lc3RhbXAiOjE3NDk5Mjk3MTh9XSwibmV4dFByZUtleUlkIjozMSwiZmlyc3RVbnVwbG9hZGVkUHJlS2V5SWQiOjMxLCJhY2NvdW50U3luY0NvdW50ZXIiOjEsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJkZXZpY2VJZCI6InFJODBfNGlYU0xDeWtwNUFYZHpUeGciLCJwaG9uZUlkIjoiOGM4NDIyMTItNzI4MS00MzFjLTlhMWItOTE4ZjQ1YmYwNTZhIiwiaWRlbnRpdHlJZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Ik1EbzRXbFVuNTFwai9hc3NKaFdsV0szRDB4dz0ifSwicmVnaXN0ZXJlZCI6dHJ1ZSwiYmFja3VwVG9rZW4iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJyelpLM1hmdTFLWDV3NmF6eWgrUEZVbjVlNXM9In0sInJlZ2lzdHJhdGlvbiI6e30sInBhaXJpbmdDb2RlIjoiRlJFREVaUkEiLCJtZSI6eyJpZCI6IjUwOTM5MTAzNDY0OjM1QHMud2hhdHNhcHAubmV0IiwibmFtZSI6InzgvbLguLjguLjguLjguLjguLjguLjDl82czaHDl/CdkJLwnZCI8J2QkfCdkIjwnZCU8J2QkuKAouC9suC4uOC4uOC4uOC4uOC4uOC4uOC4uCDjg6TvrqnZqNmA766p766p2ajZgPCWpJN8ICDgvbLwnZWw8J2WmfCdlorwnZaX8J2Wk/CdlobwnZaRIPCdlpXwnZaG8J2Wl/CdlobwnZaJ8J2WlPCdlp3gvbIiLCJsaWQiOiIxMDM1NjkzOTUwNzMyMDk6MzVAbGlkIn0sImFjY291bnQiOnsiZGV0YWlscyI6IkNKakt3clVHRU02ZHQ4SUdHQUVnQUNnQSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJYbit1SjJVOXJiM3ROd2RuQkFXZ0tScldRU2k0NWxicUVIMlNIdDVWZ0cwPSIsImFjY291bnRTaWduYXR1cmUiOiJNUkJ1azBzTGVhTi9TY2FyWTFxMTJGTXZZelduL3pIVDRpaTVGR0pDb0RWZHNYaUlMdGpGeGZvaEVIZ1RxTEN3YzRxNHpSM3ZXMFdrUzVsMWN0UzREZz09IiwiZGV2aWNlU2lnbmF0dXJlIjoiNWd1bVRWeEYrNzRXOU9IVlp3TXVEaWRLT3l4NS9YWEFMSTM5ZytRNmxKbWV4ZlVIcUx5TkN4T0lWRi9IeDd2cXhDUVBreVkrRVE1WnM1anVESVdqQXc9PSJ9LCJzaWduYWxJZGVudGl0aWVzIjpbeyJpZGVudGlmaWVyIjp7Im5hbWUiOiI1MDkzOTEwMzQ2NDozNUBzLndoYXRzYXBwLm5ldCIsImRldmljZUlkIjowfSwiaWRlbnRpZmllcktleSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkJWNS9yaWRsUGEyOTdUY0had1FGb0NrYTFrRW91T1pXNmhCOWtoN2VWWUJ0In19XSwicGxhdGZvcm0iOiJzbWJhIiwicm91dGluZ0luZm8iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJDQUlJQlE9PSJ9LCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3NDk5Mjk2OTEsImxhc3RQcm9wSGFzaCI6IjNnUFVKayIsIm15QXBwU3RhdGVLZXlJZCI6IkFBQUFBSk03In0=',
    PREFIXE: process.env.PREFIX || "+",
    GITHUB : process.env.GITHUB|| 'https://github.com/mr-X-force/LUCKY-MD-XFORCE',
    OWNER_NAME : process.env.OWNER_NAME || "FrediEzra",
    NUMERO_OWNER : process.env.NUMERO_OWNER || "255752593977",
    DEV : process.env.DEV || "FrediEzra Tz",
              
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "non",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'non',
    AUTO_REACT: process.env.AUTO_REACTION || "non",  
     AUTO_SAVE_CONTACTS : process.env.AUTO_SAVE_CONTACTS || 'no',
    URL: process.env.URL || "https://files.catbox.moe/uw4l17.jpeg",  
    URL2: process.env.URL2 || "https://files.catbox.moe/3o37c5.jpeg",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'non',              
    CHAT_BOT: process.env.CHAT_BOT || "off",              
    AUTO_READ_MESSAGES: process.env.AUTO_READ_MESSAGES || "yes",
    AUTO_BLOCK: process.env.AUTO_BLOCK || 'no', 
    GCF: process.env.GROUP_HANDLE || 'no', 
    AUTO_REPLY : process.env.AUTO_REPLY || "no", 
    AUTO_STATUS_TEXT: process.env.AUTO_STATUS_TEXT || 'Your Status Seen By LUCKY-MD-XFORCE',   
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'no',
    AUTO_BIO: process.env.AUTO_BIO || 'yes',       
    ANTI_CALL_TEXT : process.env.ANTI_CALL_TEXT || '',             
    GURL: process.env.GURL  || "https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f",
    WEBSITE :process.env.GURL || "https://whatsapp.com/channel/0029VaihcQv84Om8LP59fO3f",
    CAPTION : process.env.CAPTION || "LUCKY-MD-XFORCE",
    BOT : process.env.BOT_NAME || 'LUCKY-MD-XFORCE',
    MODE: process.env.PUBLIC_MODE || "no",              
    TIMEZONE: process.env.TIMEZONE || "Africa/Dodoma", 
    PM_PERMIT: process.env.PM_PERMIT || 'no',
    HEROKU_APP_NAME : process.env.HEROKU_APP_NAME || null,
    HEROKU_API_KEY : process.env.HEROKU_API_KEY || null,
    WARN_COUNT : process.env.WARN_COUNT || '5' ,
    ETAT : process.env.PRESENCE || '1',
    DP : process.env.STARTING_BOT_MESSAGE || "yes",
    LUCKY_ADM : process.env.ANTI_DELETE_MESSAGE || 'no',
    ANTI_DELETE_GROUP : process.env.ANTI_DELETE_GROUP || 'no',
    ANTI_CALL: process.env.ANTI_CALL || 'yes', 
    AUDIO_REPLY : process.env.AUDIO_REPLY || 'yes', 
    CHAT_BOT : process.env.CHATBOT_INBOX || "no",
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

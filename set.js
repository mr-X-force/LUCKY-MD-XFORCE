const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('set.env'))
    require('dotenv').config({ path: __dirname + '/set.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;
module.exports = { session: process.env.SESSION_ID || 'ezra',LUCKY-XFORCE••<=>eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNERkdjhLTG9JZEV4MEM1NWdNaXpJSVlEbXdldXVRS1I1N2JUY0JEc0NVbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQkdNNXp1cEVJNllVUk5jd3pVVU9GNm1oMG9sanNXb2dZZTZ3Qm9GcWUyOD0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiIyT2lsbEprdlJnTktSSWZ4VlVldlFsM2Q4R293dC9oaytmYW0rZDhsK0ZnPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJMVEF2RFNDcG9ZVjFQc2Rudk03aFgreE9oVWszaXBOcWszbTY4RzJ5bmljPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Im9MU0JvMTdHZHprVys0cEdHVW9lTVBWWmRPWk9oeUp2WUtTNHh0VUpSMlk9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImYyWVlqK2ExV3pzZWtkcGkzMlVjWTU1a21TQ3VHSVh6TDhpOEd3d3IwMEU9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiMkhQRFUvWGFOS0FKWGM3cUFyd1h5M3dpdmlYYXpxN21KUUlQRHg1R2Ewbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiRkdKMTMwTjZsSnErK2hlakVQRlh5UDdockFweXlsV3hTdWh6WDExVm5WZz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IllyWGlQT2ZwYkFPclRqUDFua0UzamVpaFBmbDZsUHRkVWw5THlQUGNXR29HODByMHdjVjNzQ0dWaTJaYnhUREkwcXhEbnk3aXBKdkNiTzhuYzRReml3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTkwLCJhZHZTZWNyZXRLZXkiOiJMTXc1djA0anNGSFA5b3pJT1lWYnhZSklKSVhSdUhTUDdNOHY1T0FjTms4PSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W3sia2V5Ijp7InJlbW90ZUppZCI6IjI1NDczMjg0OTc4MEBzLndoYXRzYXBwLm5ldCIsImZyb21NZSI6dHJ1ZSwiaWQiOiI5M0RBMjUzMjBCMzI5RUY1Qjk1QURCRjRCNTQ1NENDNyJ9LCJtZXNzYWdlVGltZXN0YW1wIjoxNzUxMTIxMjQ0fSx7ImtleSI6eyJyZW1vdGVKaWQiOiIyNTQ3MzI4NDk3ODBAcy53aGF0c2FwcC5uZXQiLCJmcm9tTWUiOnRydWUsImlkIjoiMDYyRkI0MzIyMUFFMjVGMjMxNkU4M0UwODMwOTRGNzQifSwibWVzc2FnZVRpbWVzdGFtcCI6MTc1MTEyMTI0NX1dLCJuZXh0UHJlS2V5SWQiOjMxLCJmaXJzdFVudXBsb2FkZWRQcmVLZXlJZCI6MzEsImFjY291bnRTeW5jQ291bnRlciI6MSwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sImRldmljZUlkIjoiU2l4dENtRjdTVHVrUUs4RjBMN2I1ZyIsInBob25lSWQiOiJiMzI3YjVkYS05Y2I3LTQ1MTAtYjc1Yy0zMmM1NmVjZmZkNDgiLCJpZGVudGl0eUlkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiOWdtTWZZNkFHM3VnbktBNGYza3d1OHdwSUxzPSJ9LCJyZWdpc3RlcmVkIjp0cnVlLCJiYWNrdXBUb2tlbiI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InRUeVI2cFdGY0tFcmNoVDZUTldWZTc1eWZiaz0ifSwicmVnaXN0cmF0aW9uIjp7fSwicGFpcmluZ0NvZGUiOiJGUkVERVpSQSIsIm1lIjp7ImlkIjoiMjU0NzMyODQ5NzgwOjdAcy53aGF0c2FwcC5uZXQiLCJuYW1lIjoic3RlcHNwZWR5IiwibGlkIjoiMzAwNTI0NzM0MjYwODk6N0BsaWQifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ1ByU2haUUVFTWI2LzhJR0dBTWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6IkV4SWZTcm4wcEtKUllMVlRZR2dkTGs5eTEvZi9HaDA5UUJmNUdpd3k4SDA9IiwiYWNjb3VudFNpZ25hdHVyZSI6IlJBZ2VQUWFkSG05RVpYUHZFTFhLbUlkR3FuRk9ZMlJUL3ArRlhWVWJ1Sk96enYybWVtMm01ZnNXZ1VJbHlwZXVvTmV5bXBsU2owWFF1b0ZzS2Y3cUFnPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJzMWNIY0FOVUFoWGVScm02RysrVjV5bWJvdEF4NENVQTZINE9UMEVEdm40TWozTnc0eGZNT0h3cnZrQkpIUHh4UEF6cjlFa3F1UFlyRklqamd2Z0lodz09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjI1NDczMjg0OTc4MDo3QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQlJNU0gwcTU5S1NpVVdDMVUyQm9IUzVQY3RmMy94b2RQVUFYK1Jvc012QjkifX1dLCJwbGF0Zm9ybSI6InNtYmEiLCJyb3V0aW5nSW5mbyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkNBZ0lFZz09In0sImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc1MTEyMTIzNSwibGFzdFByb3BIYXNoIjoiMUs0aEg0IiwibXlBcHBTdGF0ZUtleUlkIjoiQUFBQUFKSU0ifQ==
    PREFIXE: process.env.PREFIX || "+",
    GITHUB : process.env.GITHUB|| 'https://github.com/mr-X-force/LUCKY-MD-XFORCE',
    OWNER_NAME : process.env.OWNER_NAME || "FrediEzra",
    NUMERO_OWNER : process.env.NUMERO_OWNER || "254732849780",
    DEV : process.env.DEV || "FrediEzra Tz",
              
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "non",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'non',
    AUTO_REACT: process.env.AUTO_REACTION || "non",  
     AUTO_SAVE_CONTACTS : process.env.AUTO_SAVE_CONTACTS || 'no',
    URL: process.env.URL || "https://files.catbox.moe/uw4l17.jpeg",  
    URL2: process.env.URL2 || "https://files.catbox.moe/3o37c5.jpeg",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'non',              
    CHAT_BOT: process.env.CHAT_BOT || "no",              
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

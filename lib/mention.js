/*  +++Official frediezra tech info base vision 3.0.0 npm +++ */
// Facebook @frediezra
// Instagram @FrediEzra
// Threads @FrediEzra
// X (tweeter) @FrediEzra
// LinkedIn @FrediEzra
// YouTube @freeonlinetvT1
// github @Fred1e, @mr-X-force, @devfreetec
// WhatsApp @255752593977
// telegram t.me/FrediEzraTechInfo 
// WhatsApp channel 
// Website fredietech-website.vercel.com
// Enjoy Movies update fredi-movies-library.vercel.app
// WE AVAILABLE ALL TIME TO RECEIVE YOU REQUEST FOR ANY DEV OR UPCOMING DEV IN WHATSAPP BOTS
// **bot start npm read fredi.server.com root @Lucky-md-xforce : "^3.0.0" ***//
// prepare everything pass lucky
// frediete loaded updates 
// bot name is LUCKY MD XFORCE 



const fs = require('fs');
const path = require('path');

// Path to the JSON file storing mention data
const filePath = path.join(__dirname, '../fredie/mention.json');

// Load data from the JSON file
function loadMentionData() {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {}; // Return an empty object if the file doesn't exist or there's an error
  }
}

// Save data to the JSON file
function saveMentionData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Create the default file if it doesn't exist
if (!fs.existsSync(filePath)) {
  saveMentionData({});
}

// Function to add or update a group in the mention list
async function addOrUpdateDataInMention(url, type, message) {
  try {
    const data = loadMentionData();
    
    // Add or update the group data
    data[url] = { type, message };
    saveMentionData(data);
    console.log(`Data for URL ${url} has been added or updated in the mention list.`);
  } catch (error) {
    console.error("Error while adding or updating the data in the mention list:", error);
  }
}

// Function to update the status of a mention
async function updateStatusForMention(url, status) {
  try {
    const data = loadMentionData();
    
    // Check if the URL exists
    if (data[url]) {
      data[url].status = status; // Update the status
      saveMentionData(data);
      console.log(`Status for URL ${url} has been updated to: ${status}`);
    } else {
      console.log(`URL ${url} not found in the mention list.`);
    }
  } catch (error) {
    console.error("Error while updating the status for the mention:", error);
  }
}

// Function to retrieve all mentions
async function getAllMentions() {
  try {
    const data = loadMentionData();
    console.log("All mentions:", data);
    return data;
  } catch (error) {
    console.error("Error while retrieving all mentions:", error);
  }
}

// Function to remove a mention from the list
async function removeFromMentionList(url) {
  try {
    const data = loadMentionData();
    
    // Check if the URL exists
    if (data[url]) {
      delete data[url]; // Remove the mention
      saveMentionData(data);
      console.log(`URL ${url} has been removed from the mention list.`);
    } else {
      console.log(`URL ${url} is not in the mention list.`);
    }
  } catch (error) {
    console.error("Error while removing the mention from the list:", error);
  }
}

// Exporting the functions for external use
module.exports = {
  addOrUpdateDataInMention,
  getAllMentions,
  updateStatusForMention,
  removeFromMentionList,
};



//. ** FrediEzra Tech info 2025 | all right reserved
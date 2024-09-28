import * as dotenv from "dotenv";
dotenv.config();

const productionMode = process.env.MODE === "production";

if (productionMode) {
  console.log("❗❗ --- Starting in production mode --- ❗❗");
} else {
  console.log("--- Starting in development mode ---");
}

// api keys and credentials
const constants = {
  discordApiKey: productionMode
    ? process.env.DISCORD_API_KEY
    : process.env.DEV_DISCORD_API_KEY,
  discordClientId: productionMode
    ? process.env.DISCORD_CLIENT_ID
    : process.env.DEV_DISCORD_CLIENT_ID,
  openAIKey: process.env.OPEN_AI_KEY,
  stinkeeNotesChannel: process.env.STINKEE_NOTES_CHANNEL_ID,
};

export default constants;

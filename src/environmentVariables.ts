import * as dotenv from 'dotenv';
dotenv.config();
// api keys and credentials
const constants = {
    discordApiKey: process.env.DISCORD_API_KEY,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    openAIKey: process.env.OPEN_AI_KEY,
    stinkeeNotesChannel: process.env.STINKEE_NOTES_CHANNEL_ID
}

export default constants
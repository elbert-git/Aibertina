import * as dotenv from 'dotenv';
dotenv.config();
// api keys and credentials
const constants = {
    discordApiKey: process.env.DISCORD_API_KEY,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    openAIKey: process.env.OPEN_AI_KEY
}

export default constants
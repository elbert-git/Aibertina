console.clear();
import constants from "./environmentVariables";
import { Client, GatewayIntentBits, Interaction } from "discord.js";
import setupSlashCommands from "./commands/setupSlashCommands";
import setupCronJobs from "./modules/cron";
import Reminders from "./modules/remindersModule";
import askGPT, { askGPTWithHistory } from "./modules/askGPT";
import { commandHandlers } from "./commands/handleSlashCommands";
import { YoutubeTranscript } from 'youtube-transcript';
import { isMessageAnAibertinaReply } from "./utility";


const execution = async () => {
    // * initiated command 
    const reminders = new Reminders();
    // * setup slash commands
    await setupSlashCommands()
    // * initialising discord client
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    });
    // * on client ready
    client.on("ready", async () => {
        console.log(`Logged in as ${client.user!.tag}!`);
        setupCronJobs(client);
        reminders.discordClient = client;
    });
    // * listen to commands
    client.on("messageCreate", async (message) => {
        // if user is a reply to aibertina
        try {
            if (await isMessageAnAibertinaReply(message)) {
                const reply = await askGPTWithHistory(message)
                message.reply(reply!)
            }
        } catch (e) {
            const reply = await askGPT(`Please summarize this error in one sentence or less: ${e}`)
            message.reply(reply!)
        }
    })
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;
        // feedback to user bot is thinkingkkkkkjk
        await interaction.reply("*I'm thinking very hard uwu...*");
        try {
            // handle slash command
            console.log(interaction.commandName)
            commandHandlers[interaction.commandName](interaction)
        } catch (e) {
            const reply = await askGPT(`Please summarize this error in one sentence or less: ${e}`)
            interaction.editReply(reply!)
        }
    })
    // * login and connect client
    client.login(constants.discordApiKey);
}
execution();
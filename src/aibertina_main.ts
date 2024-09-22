console.clear();
import constants from "./environmentVariables";
import { Channel, Client, GatewayIntentBits, TextChannel } from 'discord.js';
import setupSlashCommands from "./setupSlashCommands";
import { calculateTime, sleep } from "./utility";
import askGPT from "./askGPT";
import setupCronJobs from "./cron";
import Reminders from "./commands/reminders/remindersModule";


const reminders = new Reminders()

const execution = async () => {
    // * -------------------- setup slash commands
    await setupSlashCommands();
    // * -------------------- setup discord bot
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    // on ready event
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user!.tag}!`);
        setupCronJobs(client)
        reminders.discordClient = client
    });
    // * -------------------- setup discord bot
    client.on('interactionCreate', async (interaction: any) => {
        // ignore if not a command
        if (!interaction.isChatInputCommand()) return;
        // feedback to user bot is thinking
        await interaction.reply("*I'm thinking very hard uwu...*");
        // process command
        try {
            if (interaction.commandName === 'ai') {
                const messageReceived = interaction.options._hoistedOptions[0].value;
                const reply = await askGPT(`User ${interaction.user.globalName} just said:${messageReceived}`);
                await interaction.editReply(`> ${messageReceived}` + "\n" + reply);
            }
            if (interaction.commandName === 'remind') {
                const messageReceived = interaction.options._hoistedOptions[0].value;
                const prePrompt = `
                    only return me a json of {days, hours, minutes, seconds, message}. 
                    no backticks or code blocks. Just plain text json.
                    This is really important it must only be json to be parsed. 
                    for example if you see 'remind me to go shower in 3 minutes', return {minutes:3, message:'go shower'}.
                    if you can't get get the time return {error: 'true'}.dont return markdown json, just the raw json.
                `
                const params = await askGPT(messageReceived, prePrompt)
                const paramsParsed = JSON.parse(params!)
                if (!paramsParsed.error) {
                    // calculate next time
                    const duration = calculateTime(paramsParsed)
                    const newTime = duration + Date.now()
                    // register new reminder
                    const serverId = interaction.guildId
                    const userId = interaction.user.id
                    const channelId = interaction.channelId
                    try {
                        reminders.addReminder(serverId, channelId, userId, paramsParsed.message, new Date(newTime))
                        await interaction.editReply(`a-okay senpai`);
                    }
                    catch (e) {
                        console.log(e)
                        await interaction.editReply(`hm.. i can't exactly parse that out please reword your reminder`);
                    }
                } else {
                    await interaction.editReply(`hm.. i can't exactly parse that out please reword your reminder`);
                }
            }
        }
        // handle errors
        catch (e) {
            (async () => {
                const response = await askGPT(`this is an error: ${e}. please reword it simply and in less than 50 words. please apologize and ask user to let Elbert know`)
                console.log(e)
                await interaction.editReply(response);
            })()
        }
    });
    // * -------------------- login
    client.login(constants.discordApiKey);
    sleep(3000)
}

execution()
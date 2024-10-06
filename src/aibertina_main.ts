console.clear();
import constants from "./environmentVariables";
import { Client, GatewayIntentBits, Interaction, TextChannel } from "discord.js";
import setupSlashCommands from "./commands/setupSlashCommands";
import { calculateTime, isMessageAnAibertinaReply, sleep, splitStringIntoChunks } from "./utility";
import setupCronJobs from "./modules/cron";
import { extract } from "article-parser";
import { ai } from "./commands/handleSlashCommands";
import Reminders from "./modules/remindersModule";
import askGPT, { askGPTWithHistory } from "./modules/askGPT";
import { commandHandlers } from "./commands/handleSlashCommands";


const execution = async () => {
    const reminders = new Reminders();
    // * -------------------- setup slash commands
    await setupSlashCommands();
    // * -------------------- setup discord bot
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    });
    // on ready event
    client.on("ready", async () => {
        console.log(`Logged in as ${client.user!.tag}!`);
        setupCronJobs(client);
        reminders.discordClient = client;
    });
    // * -------------------- setup discord bot
    client.on("messageCreate", async (message) => {
        // check if reply
        const initialMessageContent = message.content;
        if (message.reference) {
            // get to the root
            //but first get one up
            const initialMessageContent = message.content;
            const replyMessageData = await message.channel.messages.fetch(
                message.reference.messageId as string
            );
            const replyMessageContent = replyMessageData.content;
            console.log(initialMessageContent, replyMessageContent);
        }
    });
    client.on("interactionCreate", async (interaction: any) => {
        // ignore if not a command
        if (!interaction.isChatInputCommand()) return;
        // feedback to user bot is thinkingkkkkkjk
        await interaction.reply("*I'm thinking very hard uwu...*");
        // process command
        try {
            if (interaction.commandName === "ai") {
                const messageReceived = interaction.options._hoistedOptions[0].value;
                const reply = await askGPT(
                    `User ${interaction.user.globalName} just said:${messageReceived}`
                );
                await interaction.editReply(`> ${messageReceived}` + "\n" + reply);
            }
            if (interaction.commandName === "remind") {
                const messageReceived = interaction.options._hoistedOptions[0].value;
                const prePrompt = `
                    only return me a json of {days, hours, minutes, seconds, message}. 
                    no backticks or code blocks. Just plain text json.
                    This is really important it must only be json to be parsed. 
                    for example if you see 'remind me to go shower in 3 minutes', return {minutes:3, message:'go shower'}.
                    if you can't get get the time return {error: 'true'}.dont return markdown json, just the raw json.
                `;
                // const params = await askGPTDirect(messageReceived, prePrompt);
                const params = "" as any // ! temporary
                const paramsParsed = JSON.parse(params!);
                if (!paramsParsed.error) {
                    // calculate next time
                    const duration = calculateTime(paramsParsed);
                    const newTime = duration + Date.now();
                    // register new reminder
                    const serverId = interaction.guildId;
                    const userId = interaction.user.id;
                    const channelId = interaction.channelId;
                    try {
                        reminders.addReminder(
                            serverId,
                            channelId,
                            userId,
                            paramsParsed.message,
                            new Date(newTime)
                        );
                        await interaction.editReply(
                            `> ${messageReceived} \n a-okay senpai`
                        );
                    } catch (e) {
                        console.log(e);
                        await interaction.editReply(
                            `hm.. i can't exactly parse that out please reword your reminder`
                        );
                    }
                } else {
                    await interaction.editReply(
                        `hm.. i can't exactly parse that out please reword your reminder`
                    );
                }
            }
            if (interaction.commandName === "summarize") {
                (async () => {
                    try {
                        // fetch article content
                        await interaction.editReply(`extracting content...`);
                        const link = interaction.options._hoistedOptions[0].value;
                        const extraction = await extract(link);
                        const wordLimit = 20000;
                        if (extraction.content!.length < wordLimit) {
                            await interaction.editReply(
                                `Aibertina is reading really intently...`
                            );
                            // split into chunks
                            const chunks = splitStringIntoChunks(extraction.content!, 1000);
                            // summarise each chunk
                            let summarisedChunks = "";
                            for (let index = 0; index < chunks.length; index++) {
                                // // const summedchunk = await askGPTDirect(
                                //     `Here is the article excerpt: ${chunks[index]}`,
                                //     "summarise what you are given in brief bullet points. Don't write more than 100 words"
                                // );
                                const summedchunk = ""
                                summarisedChunks += `\n ${summedchunk}`;
                                await interaction.editReply(
                                    `Aibertina is reading really intently... ${index}/${chunks.length}`
                                );
                            }
                            const finalSummary = await askGPT(
                                `In less than 100 words (very important less than 100 words), please give me a summary in bullet points of:  ${summarisedChunks}`
                            );
                            await interaction.editReply(
                                `<@${interaction.user.id}> Here is the summary of: ${link} \n ${finalSummary}`
                            );
                        } else {
                            const msg = await askGPT(
                                `Please apologize that you can't summarise this article as it exceeds the character limit of ${wordLimit}. in less than 20 words`
                            );
                            await interaction.editReply(msg);
                        }
                    } catch (e) {
                        const response = await askGPT(
                            `this is an error: ${e}. please reword it simply and in less than 50 words. please apologize and ask user to let Elbert know`
                        );
                        console.log(e);
                        await interaction.editReply(response);
                    }
                })();
            }
        } catch (e) {
            // handle errors
            (async () => {
                const response = await askGPT(
                    `this is an error: ${e}. please reword it simply and in less than 50 words. please apologize and ask user to let Elbert know`
                );
                console.log(e);
                await interaction.editReply(response);
            })();
        }
    });
    // * -------------------- login
    client.login(constants.discordApiKey);
};

// execution();

// (async () => {
//     // const link = interaction.options._hoistedOptions[0].value;
//     const link = "https://www.bbc.com/news/live/c1m955z0veyt"
//     // fetch article content
//     const extraction = await extract(link)
//     console.log(extraction.content!.length)
//     // split into chunks
//     const chunks = splitStringIntoChunks(extraction.content!, 1000)
//     // summarise each chunk
//     let summarisedChunks = ""
//     for (let index = 0; index < chunks.length; index++) {
//         console.log('chunk', index)
//         const summedchunk = await askGPTDirect(`Here is the article excerpt: ${chunks[index]}`, "summarise what you are given in brief bullet points")
//         summarisedChunks += `\n ${summedchunk}`
//     }
//     const finalSummary = await askGPTDirect(`Here is the article excerpt: ${summarisedChunks}`, "summarise what you are given in brief bullet points")
//     console.log("=[==========================================")
//     console.log(finalSummary)
// })()

const execution_2 = async () => {
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
execution_2()
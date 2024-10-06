import askGPT, { askGPTWithJson } from "../modules/askGPT";
import { calculateTime } from "../utility";
import Reminders from "../modules/remindersModule";
import { Interaction } from "discord.js";
import { extract } from "article-parser";
import { splitStringIntoChunks } from "../utility";

export async function ai(interaction: any) {
    // get user name and message
    const messageReceived = interaction.options._hoistedOptions[0].value;
    const userName = interaction.user.displayName
    const gptIpnut = `${userName} says: "${messageReceived}"`
    // askgpt
    const reply = await askGPT(gptIpnut)
    // reply
    await interaction.editReply(`> ${messageReceived} \n ${reply}`)
}

export async function remind(interaction: any) {
    const reminders = new Reminders()
    const messageReceived = interaction.options._hoistedOptions[0].value;
    const prePrompt = `
                    only return me a json of {days, hours, minutes, seconds, message}. 
                    no backticks or code blocks. Just plain text json.
                    This is really important it must only be json to be parsed. 
                    for example if you see 'remind me to go shower in 3 minutes', return {minutes:3, message:'go shower'}.
                    if you can't get get the time return {error: 'true'}.dont return markdown json, just the raw json.
                `;
    const params = await askGPTWithJson(messageReceived, prePrompt);
    console.log('params', params)
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

export async function summarize(interaction: any) {
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
                const summedchunk = await askGPT(
                    `Here is the article excerpt: ${chunks[index]}`,
                    "summarise what you are given in brief bullet points. Don't write more than 100 words",
                );
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
}


interface CommandHandlers {
    [index: string]: (i: Interaction | any) => void
}
export const commandHandlers: CommandHandlers = {
    ai,
    remind,
    summarize
}
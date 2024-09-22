import constants from "./environmentVariables";
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const forceUpdateCommands = true;

export default async function setupSlashCommands() {
    if (forceUpdateCommands) {
        console.log("seting up slash commands")
        // * -------------- main ai command
        const aiCommand = new SlashCommandBuilder()
            .setName('ai')
            .setDescription('Talk to Aibertina')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message to send to Aibertina')
                    .setRequired(true));
        // * -------------- Create a reminder
        const remindCommand = new SlashCommandBuilder()
            .setName('remind')
            .setDescription('Task Aibertina to remind you')
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('Tell her what and when to remind you')
                    .setRequired(true));
        // * -------------- Creating the youtube summary 
        // const YTsummarise = new SlashCommandBuilder()
        //     .setName('ytsum')
        //     .setDescription('Task Aibertina to watch and summarise a youtube video for you')
        //     .addStringOption(option =>
        //         option.setName('link')
        //             .setDescription('youtube video link')
        //             .setRequired(true));
        // * -------------- Register the commands
        const commands = [aiCommand, remindCommand];
        const rest = new REST({ version: '10' }).setToken(constants.discordApiKey as string);
        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(Routes.applicationCommands(constants.discordClientId as string), { body: commands });
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
}
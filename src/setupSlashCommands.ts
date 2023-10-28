import { discord_ApiKey, discord_CLIENT_ID } from "./environmentVariables";
import { REST, Routes, SlashCommandBuilder} from 'discord.js';

const forceUpdateCommands = false;

export default async function setupSlashCommands(){
  if(forceUpdateCommands){
    console.log("seting up slash commands")
    // * -------------- main ai command
    const aiCommand = new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Talk to Aibertina')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send to Aibertina')
        .setRequired(true));
    const commands = [aiCommand];
    const rest = new REST({ version: '10' }).setToken(discord_ApiKey as string);
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(Routes.applicationCommands(discord_CLIENT_ID as string), { body: commands });

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  }
}
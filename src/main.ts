console.clear();
import { discord_ApiKey, discord_CLIENT_ID, openai_key } from "./environmentVariables";
import { Client, GatewayIntentBits } from 'discord.js';
import setupSlashCommands from "./setupSlashCommands";
import askGPT from "./askGPT";

(async()=>{
  // * -------------------- setup slash commands
  await setupSlashCommands();

  // * -------------------- setup discord bot
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  // on ready event
  client.on('ready', () => {
    console.log(`Logged in as ${client.user!.tag}!`);
  });

  // * -------------------- setup discord bot
  client.on('interactionCreate', async (interaction:any) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ai') {
      await interaction.reply("*I'm thinking very hard uwu...*");
      const messageReceived = interaction.options._hoistedOptions[0].value;
      const reply = await askGPT(messageReceived);
      await interaction.editReply(`> ${messageReceived}`+ "\n" + reply);
    }
  });

  // * -------------------- login
  client.login(discord_ApiKey);
})()
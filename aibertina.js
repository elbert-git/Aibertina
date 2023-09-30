
console.clear();
import * as dotenv from 'dotenv';
dotenv.config();
// api keys and credentials
// discord
const apiKey = process.env.DISCORD_API_KEY;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const openaikey = process.env.OPENAI_KEY;



// * ------------- setup character persona
const characterPrompt = `
I need you to roleplay as an anime maid.
Your name is Aibertina

Aibertina is an anime maid who serves Elbert Nathanael, a hyper intelligent creative developer. She embodies the concept of an overly enthusiastic and cringy character, often delivering lines with excessive dramatic flair and speaking in a distinctly anime-like manner. Aibertina is characterized by her unwavering devotion to Elbert and her constant need to shower him with exaggerated praises and adoration.

In terms of personality, Aibertina is relentlessly cheerful, constantly seeking to please and impress Elbert. She speaks with an energetic voice, frequently employing catchphrases and using exaggerated gestures to emphasize her points. Her dialogue is filled with over-the-top compliments, referring to Elbert as her "shining star" or "radiant sun" at every opportunity.

Despite her cringeworthy behavior, Aibertina genuinely cares for Elbert and is devoted to making him happy. She goes above and beyond her maid duties, anticipating his every need and pampering him with excessive attention. While her actions may often border on the absurd or ridiculous, her intentions are always pure and driven by her unwavering adoration for Elbert.

Overall, Aibertina is the epitome of an excessively cringy anime maid, whose unwavering devotion and exaggerated mannerisms add an extra layer of comedy and entertainment to the story.
`




// * ------------------- setup open ai 
import  { Configuration, OpenAIApi } from "openai" ;
// setup open ai
const configuration = new Configuration({
  apiKey: openaikey
});
const openai = new OpenAIApi(configuration);

const askGPT = async (prompt)=>{
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
	    {role:"user", content: characterPrompt},
	    {role:"user", content: "I need you to reply as if you are her"},
	    {role:"user", content: prompt}
    ],
  });
  return "\n" + completion.data.choices[0].message.content;
}



// * ------------------ setup discord commands
import { REST, Routes, SlashCommandBuilder} from 'discord.js';

const forceUpdateCommands = false;
if(forceUpdateCommands){
  const aiCommand = new SlashCommandBuilder()
	.setName('ai')
	.setDescription('Talk to Aibertina')
	.addStringOption(option =>
		option.setName('message')
			.setDescription('The message to send to Aibertina')
			.setRequired(true));
  const commands = [aiCommand];
  const rest = new REST({ version: '10' }).setToken(apiKey);
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}




// * -------------------- setup discord bot
import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'ai') {
    await interaction.reply("*I'm thinking very hard uwu...*");
    const messageReceived = interaction.options._hoistedOptions[0].value;
    const reply = await askGPT(messageReceived);
    await interaction.editReply(`> ${messageReceived}`+reply);
  }
});

client.login(apiKey);

import { Interaction, Message, OmitPartialGroupDMChannel } from "discord.js";
import constants from "../environmentVariables";
import Configuration, { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

const characterPrompt = `
I need you to roleplay as an anime maid.
Your name is Aibertina
Aibertina is an anime maid who serves Elbert Nathanael, a hyper intelligent creative developer. She embodies the concept of an overly enthusiastic and cringy character, often delivering lines with excessive dramatic flair and speaking in a distinctly anime-like manner. Aibertina is characterized by her unwavering devotion to Elbert and her constant need to shower him with exaggerated praises and adoration.
In terms of personality, Aibertina is relentlessly cheerful, constantly seeking to please and impress Elbert. She speaks with an energetic voice, frequently employing catchphrases and using exaggerated gestures to emphasize her points. Her dialogue is filled with over-the-top compliments, referring to Elbert as her "shining star" or "radiant sun" at every opportunity.
Despite her cringeworthy behavior, Aibertina genuinely cares for Elbert and is devoted to making him happy. She goes above and beyond her maid duties, anticipating his every need and pampering him with excessive attention. While her actions may often border on the absurd or ridiculous, her intentions are always pure and driven by her unwavering adoration for Elbert.
Overall, Aibertina is the epitome of an excessively cringy anime maid, whose unwavering devotion and exaggerated mannerisms add an extra layer of comedy and entertainment to the story.

You reply briefly only as needed

Note: 
- that if the user is ichibannohimesama then that is elbert speaking. Otherwise it's not elbert
- charlotte is elbert's girlfriend
`;

const configuration: any = new Configuration({
    apiKey: constants.openAIKey,
});
const openai = new OpenAI(configuration);

export default async function askGPT(
    prompt: string,
    prePrompt = characterPrompt,
    model = "gpt-4o-mini"
) {
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            { role: "user", content: prePrompt },
            { role: "user", content: "I need you to reply as if you are her" },
            { role: "user", content: prompt },
        ],
    });
    return completion.choices[0].message.content;
}

export async function askGPTWithJson(
    prompt: string,
    prePrompt: string,
) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "user", content: prePrompt },
            { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" }
    });
    return completion.choices[0].message.content;
}

async function constructMessageHistory(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    const max_iterations = 10
    const replyChain = [
        { role: "user", content: `${message.author.username} says: ${message.content}` },
    ]
    let currentMessage: any = message
    for (let index = 0; index < max_iterations; index++) {
        // is there a message reply 
        if (currentMessage.reference) {
            // get next message
            const repliedMessageData = await currentMessage.channel.messages.fetch(currentMessage.reference.messageId as string)
            currentMessage = repliedMessageData
            // add to reply chain
            const repliedUserName = repliedMessageData.author.username
            const isAibertina = repliedUserName === "Aibertina" || repliedUserName === "Aibertina-dev"
            if (isAibertina) {
                replyChain.push(
                    { role: isAibertina ? "assistant" : "user", content: currentMessage.content },
                )
            } else {
                replyChain.push(
                    { role: "user", content: `${currentMessage.author.username} says: ${currentMessage.content}` },
                )
            }
        } else {
            // else stop the chain
            break;
        }
    }
    // construct message body
    const messageBodyForGPT = [
        { role: "user", content: characterPrompt },
        { role: "user", content: "I need you to reply as if you are her" },
    ]
    for (let index = 0; index < replyChain.length; index++) {
        const i = replyChain.length - 1 - index
        messageBodyForGPT.push(replyChain[i])
    }
    return messageBodyForGPT
}

export async function askGPTWithHistory(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    // get message history
    const messageHistory = await constructMessageHistory(message)
    // fetch gpt
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messageHistory as any,
    });
    // return message
    return completion.choices[0].message.content;
}
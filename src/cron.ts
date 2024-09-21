import { CronJob } from "cron";
import { Client, TextChannel } from "discord.js";
import askGPT from "./askGPT";
import constants from "./environmentVariables";

export default function setupCronJobs(client: Client) {
    const honeyLunchReminder = new CronJob(
        '0 13 * * *', // cron time 7pm everyday 
        async () => {
            const channel = client.channels.cache.get(constants.stinkeeNotesChannel!) as TextChannel
            channel.send(await askGPT('remind charlotte to have lunch') as string)
        }, // callback func
        null, // oncomplete
        true, // start
        'Australia/Brisbane' // timezone
    )
    const honeyDinnerReminder = new CronJob(
        '0 19 * * *', // cron time 7pm everyday 
        async () => {
            const channel = client.channels.cache.get(constants.stinkeeNotesChannel!) as TextChannel
            channel.send(await askGPT('remind charlotte to have dinner') as string)
        }, // callback func
        null, // oncomplete
        true, // start
        'Australia/Brisbane' // timezone
    )
    console.log('setup cron jobs')
}
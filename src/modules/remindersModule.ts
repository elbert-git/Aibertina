import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, TextChannel, channelLink } from 'discord.js'
import * as fs from 'fs'
import askGPT from './askGPT'

interface ReminderLog {
    message: string
    time: number
    channelId: string
    userId: string
    fired: boolean
}

export default class Reminders {
    currentData: { [index: string]: Array<ReminderLog> } = {}
    dataFolder = "dataFolder/"
    discordClient: Client | null = null
    static instance: Reminders | null = null
    constructor() {
        // singleton
        if (Reminders.instance) {
            return Reminders.instance
        }
        Reminders.instance = this

        try {
            // load up disk
            this.loadDataFromDisk()
            // start ticker
            setInterval(this.tick.bind(this), 1000 * 60)
            this.tick()
        }
        catch (e) {
            console.log('error starting up reminders module', e)
        }
    }
    // * --- CRUD
    addReminder(serverId: string, channelId: string, userId: string, message: string, time: Date) {
        if (!this.currentData[serverId]) {
            this.currentData[serverId] = []
        }
        // create an entry in the array
        this.currentData[serverId].push({
            message: message,
            time: time.getTime(),
            channelId: channelId,
            userId: userId,
            fired: false
        })
    }
    getReminders(serverId: string) {
        if (this.currentData[serverId]) {
            return { ...this.currentData[serverId] }
        } else {
            return null
        }
    }
    updateReminders(serverId: string, reminderId: string, message: string, time: string) {

    }
    deleteReminders(serverId: string, reminderId: string) {

    }
    // * --- ticker
    tick() {
        try {
            console.log('reminder tick')
            // parse throught every remidner
            const serverIds = Object.keys(this.currentData)
            serverIds.forEach((serverId) => {
                this.currentData[serverId].forEach((reminderLog) => {
                    const time = reminderLog.time
                    const gapInSeconds = (Math.abs(time - Date.now()) / 1000)
                    if (gapInSeconds <= 60) {
                        console.log("reminder triggered", reminderLog.message)
                        // process the reminder
                        if (this.discordClient) {
                            (async () => {
                                if (reminderLog.fired) { return null }
                                const channel = this.discordClient!.channels.cache.get(reminderLog.channelId) as TextChannel
                                const message = await askGPT(`Here's a reminder for the user: ${reminderLog.message}. Please reminde them of this in less than 30 words`)
                                // create buttons
                                // const b = new ButtonBuilder()
                                //     .setCustomId('snooze')
                                //     .setLabel('snooze')
                                //     .setStyle(ButtonStyle.Primary)
                                // const row: any = new ActionRowBuilder()
                                //     .addComponents(b)
                                // send response
                                // await channel!.send(`Hi! <@${reminderLog.userId}> \n > ${reminderLog.message} \n ${message}`)
                                const resAFterSend = await channel!.send({
                                    content: `Hi! <@${reminderLog.userId}> \n > ${reminderLog.message} \n ${message}`,
                                    // components: [row]
                                })
                                reminderLog.fired = true
                                // try {
                                //     const snoozeResponse = await resAFterSend.awaitMessageComponent({
                                //         time: 10_000
                                //     })
                                //     if (snoozeResponse.customId === "snooze") {
                                //         console.log('snoozeddd!!!')
                                //         snoozeResponse.editReply('okie will defer this by 1 hour')
                                //     }
                                // }
                                // catch (e) {
                                //     // i think this fires if user doesnt follow up with interaction
                                //     console.log('snooze time limit up, no more')
                                //     resAFterSend
                                // }
                            })();
                        }
                    }
                })
                // cull past reminders reminders
                this.currentData[serverId] = this.currentData[serverId].filter((reminderLog) => {
                    return !reminderLog.fired
                })
            })
            this.saveDataToDisk()
        }
        catch (e) {
            console.log('error while reminder tick')
            console.log(e)
        }
    }
    // * --- data stuff
    saveDataToDisk() {
        // stringify data
        const dataString = JSON.stringify(this.currentData)
        // save data to sidk
        fs.writeFileSync(`${this.dataFolder}/data.json`, dataString, 'utf-8')
    }
    loadDataFromDisk() {
        const dataString = fs.readFileSync(`${this.dataFolder}/data.json`, 'utf-8')
        this.currentData = JSON.parse(dataString)
    }
}
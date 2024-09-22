import * as fs from 'fs'

interface ReminderLog {
    message: string
    time: Date
    serverId: string
    channelId: string
}

export default class RemindersDataModule {
    savingCount = 0
    savingBackupCount = 3
    currentData: { [index: string]: Array<ReminderLog> } = {}
    dataFolder = "dataFolder/"
    constructor() {

    }
    saveDataToDisk() {
        // stringify data
        const dataString = JSON.stringify(this.currentData)
        // save data to sidk
        fs.writeFileSync(`${this.dataFolder}/data${this.savingCount}.json`, dataString, 'utf-8')
        // iterate save count
        this.savingCount = (this.savingCount + 1) % this.savingBackupCount
    }
}
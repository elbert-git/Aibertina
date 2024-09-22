export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateTime(params: { [index: string]: number }) {
    const lengthDict: { [index: string]: number } = {
        days: 1000 * 60 * 60 * 24,
        hours: 1000 * 60 * 60,
        minutes: 1000 * 60,
        seconds: 1000,
    }
    const keys = Object.keys(params)
    let total = 0
    keys.forEach((key) => {
        if (key !== "message") {
            total += lengthDict[key] * params[key]
        }
    })
    return total
}

export function splitStringIntoChunks(string: string, n = 1000) {
    let chunks = [];
    for (let i = 0; i < string.length; i += n) {
        chunks.push(string.slice(i, i + n));
    }
    return chunks;
}
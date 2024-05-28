import { createClient } from 'redis'

let client

function initClient() {
    // connects to localhost on port 6379
    return createClient()
        .on('ready', () => console.log('Opened connection to Redis'))
        .on('error', err => console.log('Redis Client Error', err))
        .on('end', () => console.log('Closed connection to Redis'))
        .connect()
}

async function getClient() {
    if(client === undefined) {
        client = await initClient()
    }
    return client
}

async function disconnect() {
    (await client).disconnect()
}

const redisService = {
    get database() {
        return getClient()
    },
    disconnect,
}

export default redisService

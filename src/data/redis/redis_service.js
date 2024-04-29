// import { createClient } from 'redis';

// class RedisService {
//     static #instance
//     #client
    
//     RedisService() {
        
//     }

//     static get instance() {
//         if(this.#instance === undefined) {
//             this.#instance = new RedisService()
//         }
//         return this.#instance
//     }

//     get client() {
//         if(this.#client === undefined) {
//             // connects to localhost on port 6379 
//             this.#client = createClient()
//                 .on('ready', () => console.log('Opened connection to Redis'))
//                 .on('error', err => console.log('Redis Client Error', err))
//                 .on('end', () => console.log('Closed connection to Redis'))
//                 .connect();
//         }
//         return this.#client
//     }

//     async test() {
//         const arr = []
        
//         const client = await createClient()
//         .on('ready', () => console.log('Opened connection to Redis'))
//         .on('error', err => console.log('Redis Client Error', err))
//         .on('end', () => console.log('Closed connection to Redis'))
//         .connect()
//         // client.set()
//     }

//     async disconnect() {
//         (await this.#client).disconnect()
//     }
// }

// export default RedisService
import neo4j from "neo4j-driver";

class Neo4jService {
    static #instance
    #driver
    
    Neo4jService() {
        
    }

    static get instance() {
        if(this.#instance === undefined) {
            this.#instance = new Neo4jService()
        }
        return this.#instance
    }

    get driver() {
        if(this.#driver === undefined) {
            this.#driver = this.#createDriver()
            console.log("Connected to database successfully")
        }
        return this.#driver
    }

    #createDriver() {
        // const url = 'neo4j+s://897417de.databases.neo4j.io'
        const url = 'bolt://localhost:7687'
        const username = 'neo4j'
        // const password = '8dZ5aKvfqwvu8Jye2BbTGQEBBzDvOqYHnomp83MJXJo'
        const password = '0365466031'
        return neo4j.driver(
            url,
            neo4j.auth.basic(username, password),
            {
                maxTransactionRetryTime: 30000,
            },
        )
    }

    async closeDriver() {
        return this.#driver.close()
    }
}

export default Neo4jService

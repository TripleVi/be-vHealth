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
            console.log("Connected to Neo4j successfully")
        }
        return this.#driver
    }

    #createDriver() {
        const username = 'neo4j'
        const url = 'neo4j+s://9b214f0a.databases.neo4j.io'
        const password = 'b7pMbM1Xmx5X0Mk1S7jf3_be9Q3RbwzAn6uHO79-hcg'
        // const url = 'bolt://localhost:7687'
        // const password = '0365466031'
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

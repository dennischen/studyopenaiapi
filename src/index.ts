import { OpenAI, ClientOptions } from 'openai'
import * as readline from 'readline'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'


const envPaths = ['./.env', './.env.dev.local']

envPaths.forEach((p) => {
    p = path.resolve(p)
    if (fs.existsSync(p)) {
        console.log("Use envirnoment", p)
        dotenv.config({ path: p, override: true })
    }

})

// Load OpenAI API key from environment variable


const clientOptions: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
}
const openai = new OpenAI(clientOptions)


// Initialize messages array
// const messages: ChatCompletionRequestMessage[] = [];

// // Initialize readline interface
// const userInterface = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });


async function main() {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Say this is a test in Chinese' }],
        model: 'gpt-3.5-turbo',
    })
    console.log(">>chatCompletion", chatCompletion)
    console.log(">>JSON", JSON.stringify(chatCompletion))
}

main()
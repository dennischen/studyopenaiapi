import chalk from 'chalk'
import fs from 'fs'
import moment from 'moment'
import { OpenAI } from 'openai'
import { Assistant } from 'openai/resources/beta/assistants/assistants'
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages'
import { Run } from 'openai/resources/beta/threads/runs/runs'
import { Thread } from 'openai/resources/beta/threads/threads'
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources/index'
import readline from 'readline'
import { OpenAiClientOptions as clientOptions, error, log } from './utils.js'

export async function hellogpt() {
    const openai = new OpenAI(clientOptions)
    const chatCompletion: ChatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Say Hello by Top 10 languages in the world' }],
        model: 'gpt-3.5-turbo',
    })
    log(chatCompletion)
    log(chatCompletion.choices[0]?.message)
}



//Legacy complete, handle all history message by our own
export async function chat() {
    const openai = new OpenAI(clientOptions)
    // Initialize messages array
    const messages: ChatCompletionMessageParam[] = []

    // Initialize readline interface
    const userInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    userInterface.setPrompt(`\n${chalk.blue('Send a message:')}\n`)
    userInterface.prompt()
    userInterface.on('line', async (input) => {
        log(chalk.blue('user:'), input)

        // Create request message and add it to messages array
        const requestMessage: ChatCompletionMessageParam = {
            role: 'user',
            content: input,
        }
        messages.push(requestMessage)

        // Call OpenAI API to generate response
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
        })

        // Display response message to user
        const responseMessage = completion.choices?.[0]?.message
        if (responseMessage) {
            log(chalk.green(responseMessage.role + ':'), responseMessage.content)
            messages.push({
                role: responseMessage.role,
                content: responseMessage.content,
            })
        } else {
            log(chalk.red("No response"))
        }

        //Prompt user for next message
        userInterface.prompt()
    })
}

//new beta assistant api, store thread, message, run in openai
export async function assistant_file(file: string, assistantId?: string, threadId?: string) {
    const openai = new OpenAI(clientOptions)

    let assistant: Assistant | undefined

    try {
        assistant = await ((assistantId && assistantId !== '*') ? openai.beta.assistants.retrieve(assistantId) : undefined)
    } catch (err) {
        error(err)
    }

    if (assistantId && assistantId !== '*') {
        if (!assistant) {
            error(`No such assistant ${assistantId}`)
            return
        }
    } else {
        const assistants = (await openai.beta.assistants.list()).data
        log(chalk.blue('Assistants :'), assistants)

        if (assistants?.length > 0) {
            assistant = assistants[0]
        } else {
            error(`No assistant`)
            return
        }
    }
    log(chalk.blue('Use assistant :'), assistant)


    let thread: Thread | undefined

    try {
        thread = await ((threadId && threadId !== '*') ? openai.beta.threads.retrieve(threadId) : openai.beta.threads.create())
    } catch (err) {
        error(err)
    }
    if (threadId && threadId !== '*') {
        if (!thread) {
            error(`No such thread ${threadId}`)
            return
        }
        log(chalk.blue('Use thread :'), thread)
    } else {
        if (!thread) {
            error(`Create thread fail`)
            return
        }
        log(chalk.blue('New thread :'), thread)
    }


    const content = fs.readFileSync(file, {
        encoding: 'utf-8'
    })

    log(file, content.length)

    const messages = (await openai.beta.threads.messages.list(thread.id)).data
    log(chalk.green('Messages'), messages)

    let message: ThreadMessage
    if (messages.length > 0) {
        message = messages[0]
        log(chalk.blue('Use Message'), message)
    } else {
        message = await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: content,
            }
        )
        log(chalk.blue('Create Message'), message)
    }

    let run = await openai.beta.threads.runs.create(
        thread.id, {
        assistant_id: assistant.id,
    })
    log(chalk.blue('Create Run'), run)

    run = await waitRunCompleted(thread.id, run.id)
    log(chalk.blue('Run completed'), run)
}

export async function waitRunCompleted(threadId: string, runId: string): Promise<Run> {
    const openai = new OpenAI(clientOptions)
    const t1 = moment()
    return new Promise<Run>((resolve, reject) => {
        (async function wait() {
            try {
                const run = await openai.beta.threads.runs.retrieve(threadId, runId)
                if (run.status === 'queued' || run.status === 'in_progress') {
                    const duration = moment.duration(moment().diff(t1))
                    log(chalk.blue('Wait for run'), duration.asMilliseconds() / 1000 + ' ms', run?.status, run)
                    setTimeout(wait, 1000 + Math.max(Math.random() * 1000))
                } else {
                    resolve(run)
                }
            } catch (err) {
                reject(err)
            }
        })()
    })
}


export async function dump_assistants() {

    const openai = new OpenAI(clientOptions)

    const assistants = (await openai.beta.assistants.list({ order: 'asc' })).data

    log(chalk.green('Assistants'), assistants)
}

export async function dump_thread(threadId: string) {

    const openai = new OpenAI(clientOptions)

    const thread = (await openai.beta.threads.retrieve(threadId))

    log(chalk.green('Thread'), thread)
}



export async function dump_runs(threadId: string) {

    const openai = new OpenAI(clientOptions)

    const runs = (await openai.beta.threads.runs.list(threadId, { order: 'asc' })).data

    log(chalk.green('Runs'), runs)
}


export async function dump_steps(threadId: string, runId: string) {

    const openai = new OpenAI(clientOptions)

    const steps = (await openai.beta.threads.runs.steps.list(threadId, runId, { order: 'asc' })).data

    log(chalk.green('Steps'), steps)
}



export async function dump_messages(threadId: string) {

    const openai = new OpenAI(clientOptions)

    const messages = (await openai.beta.threads.messages.list(threadId, { order: 'asc' })).data
    log(chalk.green('Messages'), messages)

}

export async function dump_messages_content(threadId: string) {

    const openai = new OpenAI(clientOptions)

    const messages = (await openai.beta.threads.messages.list(threadId, { order: 'asc' })).data
    messages.forEach((msg) => {
        log(`${chalk.green(msg.role)}:\n`, (msg.content[0] as any).text.value)
    })

}


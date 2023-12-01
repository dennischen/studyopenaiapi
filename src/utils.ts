import chalk from 'chalk'
import dotenv from 'dotenv'
import fs from 'fs'
import moment from 'moment'
import type { ClientOptions } from 'openai'
import path from 'path'
import stripAnsi from 'strip-ansi'

const startMoment = moment()
const logsDir = path.resolve('./logs')
const logFile = path.resolve(logsDir, `log-${startMoment.format('YYYYMMDDHHmmss')}-${process.pid}.log`)

export function log(...logs: any[]) {

    console.log(...logs)

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir)
    }

    if (fs.existsSync(logFile)) {
        fs.appendFileSync(logFile, '\n')
    }

    logs.forEach((log, idx) => {
        log = (idx === 0 ? '' : ' ') + (typeof log === 'object' ? JSON.stringify(log) : typeof log === 'string' ? (stripAnsi(log)) : log)
        fs.appendFileSync(logFile, log, {
            encoding: 'utf-8',
        })
    })

}

export function error(err: any) {
    if (typeof err === 'object') {
        log(chalk.red(`Error :`), err)
    } else {
        log(chalk.red(`Error : ${err}`))
    }
}

const envPaths = ['./.env', './.env.dev.local']

envPaths.forEach((p) => {
    p = path.resolve(p)
    if (fs.existsSync(p)) {
        console.log("Use envirnoment", p)
        dotenv.config({ path: p, override: true })
    }

})


// Load OpenAI API key from environment variable
export const OpenAiClientOptions: ClientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
}

const functions: Map<string, Function> = new Map()
export function putFunction(fn: Function) {
    functions.set(fn.name, fn)
}

export function getFunctions(){
    return new Map(functions);
}
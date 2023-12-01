import chalk from "chalk"
import minimist from "minimist"
import { error, log, getFunctions, putFunction } from "./utils.js"

import { hellogpt, assistant_file, chat, dump_messages_content, dump_assistants, dump_messages, dump_runs, dump_steps, dump_thread } from "./assistant.js"


putFunction(hellogpt)
putFunction(assistant_file)
putFunction(chat)
putFunction(dump_thread)
putFunction(dump_assistants)
putFunction(dump_messages)
putFunction(dump_messages_content)
putFunction(dump_runs)
putFunction(dump_steps)


async function test() {
    log(chalk.red('Error me'))
}
putFunction(test)

export default function main() {
    const argv = minimist(process.argv.slice(2), {
        alias: {
            'h': 'help'
        }
    })
    console.log(chalk.blue("====================="))
    process.on("exit", (code) => {
        console.log(chalk.blue("====================="))
        console.log(chalk.blue("exit", code))
    })

    const functions = getFunctions()

    if (argv.help || !argv._ || argv._?.length == 0) {
        console.log('Run:')
        console.log('    yarn start <case>')
        console.log('')
        console.log(`Available functions : [${Array.from(functions.keys()).join(', ')}]`)
        return
    }
    if (argv._?.length > 0) {
        const c = argv._[0]
        if (!functions.has(c)) {
            error(`Function ${c} not found, available functions : [${Array.from(functions.keys()).join(', ')}]`)
        } else {
            functions.get(c)?.apply(undefined, argv._.slice(1))
        }
    }
}

main()

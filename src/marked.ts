import { Marked, Token } from 'marked'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';

//need construct it in es module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function marked() {

    const text = fs.readFileSync(path.join(__dirname, 'standard.md'))


    const walkTokens = async (token: Token) => {
        console.log(">>:", token.type)
        if (token.type === 'text') {
            console.log(">>>>", token.text)
        }
    }

    const themarked = new Marked()

    themarked.use({ walkTokens, async: true })

    // const html = await themarked.parse('# Marked in the browser\n\nRendered by `**marked**`.\n\n```tsx\nIn the code block\n line2 \n```')
    const html = await themarked.parse(String(text))
    // console.log(html)


}
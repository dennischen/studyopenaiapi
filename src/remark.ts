import rehypeStringify from 'rehype-stringify'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'


export async function remark() {
    //markdown to html
    const html = await unified()
        .use(remarkParse) //parser
        .use(remarkRehype) 
        .use(rehypeStringify)
        .process('# Hello, *Mercury*!')

    console.log(">>>html", html)
    console.log(">>>html", String(html))

    //html to markdown
    const markdown = await unified()
        .use(rehypeParse) //parser
        .use(rehypeRemark) //compiler
        .use(remarkStringify) //compiler
        .process('<h1>Hello, <em>Mercury</em>!</h1>')

    console.log(">>>remark", markdown)
    console.log(">>>remark", String(markdown))
}
import assert from "node:assert"
import { get_encoding } from "tiktoken"

export async function count_gpt2_token() {

    const enc = get_encoding("gpt2")
    const sentences = ["hello world hello world", "A B C A B D", "這個中文句子算幾個"]

    sentences.forEach(s => {
        console.log("=======================")
        console.log(`case ${s}`, s.length)
        const encodedUnit32Array = enc.encode(s)
        const decodedUnit8Array = enc.decode(encodedUnit32Array)
        console.log(">>>encodedUnit32Array, the token count ", encodedUnit32Array, encodedUnit32Array.length)
        console.log(">>>decodedUnit8Array, the character count (count 2 for 2bytes character)", decodedUnit8Array, decodedUnit8Array.length)
        const decodedText = new TextDecoder().decode(decodedUnit8Array)
        console.log(">>>", decodedText)
        assert(decodedText === s)
    })

    enc.free()

}

//require/load dynamically for partial model
import { Tiktoken } from "tiktoken/lite"
import { load } from "tiktoken/load"
import registry from "tiktoken/registry.json" assert { type: 'json'}
import models from "tiktoken/model_to_encoding.json" assert { type: 'json'}

export async function count_gpt_35_token() {

    //gpt-3.5-turbo is cl100k_base
    const model = await load((registry as any)[models["gpt-3.5-turbo"]])
    const enc = new Tiktoken(
        model.bpe_ranks,
        model.special_tokens,
        model.pat_str
    )

    const sentences = ["hello world hello world", "A B C A B D", "這個中文句子算幾個"]

    sentences.forEach(s => {
        console.log("=======================")
        console.log(`case ${s}`, s.length)
        const encodedUnit32Array = enc.encode(s)
        const decodedUnit8Array = enc.decode(encodedUnit32Array)
        console.log(">>>encodedUnit32Array, the token count ", encodedUnit32Array, encodedUnit32Array.length)
        console.log(">>>decodedUnit8Array, the character count (count 2 for 2bytes character)", decodedUnit8Array, decodedUnit8Array.length)
        const decodedText = new TextDecoder().decode(decodedUnit8Array)
        console.log(">>>", decodedText)
        assert(decodedText === s)
    })

    enc.free()
}
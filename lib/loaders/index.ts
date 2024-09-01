import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { HTMLLoader } from "./html-loaders"
import { JSONLoader } from "./json-loader"
import { PlainTextLoader } from "./plain-text-loader"
import { Document } from "langchain/document"

export const loadFile = (blob: Blob): Document[] => {
    const {type} = blob
    
    if (!type) {
        console.error('Could not determin the type of the file.')
    }

    const loaderMap = {
        'application/json': JSONLoader,
        'text/html': HTMLLoader,
        'application/pdf': WebPDFLoader,
    }

    const Loader = loaderMap[type] || PlainTextLoader

    const loader = new Loader(blob)
    return loader.load()
}
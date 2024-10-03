import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { HTMLLoader } from "./html-loaders"
import { JSONLoader } from "./json-loader"
import { PlainTextLoader } from "./plain-text-loader"
import { Document } from "langchain/document"
import { PdfLoader } from "./pdf-loader"

export const loadFile = async (blob: Blob): Promise<Document[]> => {
    const {type} = blob
    
    if (!type) {
        console.error('Could not determin the type of the file.')
    }

    const loaderMap = {
        'application/json': JSONLoader,
        'text/html': HTMLLoader,
        'application/pdf': PdfLoader,
        'default': PlainTextLoader
    }

    const loader = new (loaderMap[type] || loaderMap['default'])(blob);
    return loader.load();
}
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"

export function loadDocument(arrayBuffer: ArrayBuffer|Buffer) {
    const blob = new Blob([arrayBuffer], { type: "application/pdf" })
    const loader = new WebPDFLoader(blob)
    
    return loader.load()
}
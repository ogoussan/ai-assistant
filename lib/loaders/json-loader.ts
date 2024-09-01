import { BaseDocumentLoader } from "@langchain/core/document_loaders/base"
import { BaseDocumentTransformer } from "@langchain/core/documents"
import { Document } from "langchain/document"

export class JSONLoader implements BaseDocumentLoader {
    private blob
    
    constructor(blob) {
        this.blob = blob
    }

    async load(): Promise<Document[]> {
        const text = await this.blob.text()
        const jsonData = JSON.parse(text)
        return [{ pageContent: JSON.stringify(jsonData), metadata: {name: this.blob.name} }]
    }

    async loadAndSplit(splitter?: BaseDocumentTransformer): Promise<Document[]> {
        return []
    }
}
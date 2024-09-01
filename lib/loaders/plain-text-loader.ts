import { BaseDocumentLoader } from "@langchain/core/document_loaders/base"
import { BaseDocumentTransformer } from "@langchain/core/documents"
import { Document } from "langchain/document"

export class PlainTextLoader implements BaseDocumentLoader {
    private blob
    
    constructor(blob: Blob) {
        this.blob = blob
    }

    async load() {
        const text = await this.blob.text();
        const {name, type, size} = this.blob
        return [{ pageContent: text, metadata: {name, type, size} }];
    }

    async loadAndSplit(splitter?: BaseDocumentTransformer): Promise<Document[]> {
        return []
    }
}
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class PlainTextLoader implements BaseDocumentLoader {
    private blob
    
    constructor(blob: Blob) {
        this.blob = blob
    }

    async load() {
        const text = await this.blob.text();
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 800,
            chunkOverlap: 400,
        });
        
        return splitter.createDocuments([text]);
    }

    async loadAndSplit(): Promise<Document[]> {
        return []
    }
}
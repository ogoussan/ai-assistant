import { BaseDocumentLoader } from "@langchain/core/document_loaders/base"
import { BaseDocumentTransformer } from "@langchain/core/documents"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export class JSONLoader implements BaseDocumentLoader {
    private blob
    
    constructor(blob) {
        this.blob = blob
    }

    async load(): Promise<Document[]> {
        const text = await this.blob.text();
        const formattedJsonText = JSON.stringify(text, undefined, 2)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 800,
            chunkOverlap: 400,
        });
        
        return splitter.createDocuments([formattedJsonText]);
    }

    async loadAndSplit(): Promise<Document[]> {
       return [] 
    }
}
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf"
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base"
import { BaseDocumentTransformer } from "@langchain/core/documents"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export class PdfLoader implements BaseDocumentLoader {
    private blob
    
    constructor(blob) {
        this.blob = blob
    }

    async load(): Promise<Document[]> {
        const documents = await new WebPDFLoader(this.blob).load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 800,
            chunkOverlap: 400,
        });
        
        return splitter.createDocuments(documents.map(({pageContent}) => pageContent));
    }

    async loadAndSplit(): Promise<Document[]> {
       return [] 
    }
}
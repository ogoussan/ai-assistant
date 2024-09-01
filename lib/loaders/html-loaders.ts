import { BaseDocumentLoader } from '@langchain/core/document_loaders/base'
import { BaseDocumentTransformer } from '@langchain/core/documents';
import * as cheerio from 'cheerio'
import { Document } from "langchain/document"

export class HTMLLoader implements BaseDocumentLoader {
    private blob

    constructor(blob) {
        this.blob = blob
    }

    async load() {
        const text = await this.blob.text()
        const $ = cheerio.load(text)
        const pageContent = $('body').text()
        return [{ pageContent, metadata: {} }]
    }

    async loadAndSplit(splitter?: BaseDocumentTransformer): Promise<Document[]> {
        return []
    }
}
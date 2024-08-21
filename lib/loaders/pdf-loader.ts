import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";

export function loadDocument(arrayBuffer: ArrayBuffer|Buffer, fileName: string) {
    const loader = new UnstructuredLoader({buffer: Buffer.from(arrayBuffer), fileName})
    
    return loader.load()
}
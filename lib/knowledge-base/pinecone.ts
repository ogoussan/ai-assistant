import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

export async function getVectorStore() {
    return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    })
}

export async function addDocuments(documents: Document[], ids: string[]) {
  const vectorStore = await getVectorStore();

  return vectorStore.addDocuments(documents, ids);
}

export async function deleteDocuments(ids: string[]) {
  const vectorStore = await getVectorStore();

  return vectorStore.delete({ids});
}

export async function similaritySearch(query: string, filter?: object) {
  const vectorStore = await getVectorStore() 
  const similaritySearchWithScoreResults = await vectorStore.similaritySearchWithScore(query, 20, filter);

  for (const [doc, score] of similaritySearchWithScoreResults) {
    console.log(
      `* [SIM=${score.toFixed(3)}] ${doc.pageContent} [${JSON.stringify(
        doc.metadata
      )}]`
    );
  }
}
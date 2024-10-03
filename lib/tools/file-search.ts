import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { similaritySearch } from "../knowledge-base/pinecone";

const fileSearchSchema = z.object({
    query: z.string().describe("retrieval query")
});

export const fileSearchTool = tool(async ({query}) => {
    similaritySearch(query);
}, {
    name: 'file-search',
    description:  'Retrieves relevant information from knowledge base for a specific query',
    schema: fileSearchSchema,
})
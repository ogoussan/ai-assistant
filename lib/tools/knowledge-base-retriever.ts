import { DynamicTool, DynamicStructuredTool, Tool } from "@langchain/core/tools";
import { getVectorStore } from "../knowledge-base/pinecone";
import { SIMILARITY_SEARCH_MAX_RESULTS } from "@/constants/agent.config";
import { z } from "zod";

export const konwledgeBaseRetreiver = new DynamicStructuredTool({
  name: "knowledge-base-retriever",
  description: "Retrieves relevant context from knowledge base.",
  schema: z.object({
    query: z.string(),
    filter: z.object({}),
  }),
  func: async ({query, filter}) => {
    const vectorStore = await getVectorStore();
    const result = await vectorStore.similaritySearch(query, SIMILARITY_SEARCH_MAX_RESULTS, filter);

    return result.map(({ pageContent }) => pageContent).join("\n");
  },
});
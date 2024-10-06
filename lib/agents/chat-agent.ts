import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatOpenAI, formatToOpenAITool } from "@langchain/openai";
import { konwledgeBaseRetreiver } from "../tools/knowledge-base-retriever";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

const tools = [
  konwledgeBaseRetreiver
].map((tool) => formatToOpenAITool(tool))

export class ChatAgent {
  public static async createAgent() {
    const memoryPrompt = ChatPromptTemplate.fromMessages([
      ["system", 
        `
        You're an intelligent chat agent with a knowledge base from which you can retrieve relevant chunks with the 'knowledge-base-retriever' tool.
        Base all your answers only on information from the knowledge base.
        If no relevant information was found respond with "I don't know".
        Always use the retiever tool for any question.
        `
      ],
      new MessagesPlaceholder("chatHistory"),
      ["user", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt: memoryPrompt,
    });

    return new AgentExecutor({
      agent,
      tools: [konwledgeBaseRetreiver],
      verbose: true,
    });
  }
}
import { ChatOpenAI } from "@langchain/openai"
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts"
import { RunnableWithMessageHistory } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory"
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { PineconeTranslator } from "@langchain/pinecone";
import { Message } from "../types"
import { getVectorStore } from "../knowledge-base/pinecone"

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const historyPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You're an helpful assistant"],
  new MessagesPlaceholder("history"),
  ["human", "{message}"],
]);

const stringOutputParser = new StringOutputParser()
const chain = historyPromptTemplate.pipe(llm).pipe(stringOutputParser);

export async function respondToUserMessage(message: Message, previousMessages: Message[], chatId = '') {
  const vectorStore = await getVectorStore();
  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm,
    vectorStore,
    documentContents: '',
    attributeInfo: [],
    structuredQueryTranslator: new PineconeTranslator(),
  })
  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: () => getHistoryFromMessages(previousMessages),
    inputMessagesKey: "message",
    historyMessagesKey: "history",
  });

  const result = await selfQueryRetriever.invoke(message.content as string)
  const context = result.map(({ pageContent }) => pageContent).join("\n");
  console.log('retrieved context: ', context)

  return await chainWithHistory.stream({
    message: `
      You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.

      Question: ${message.content} 

      Context: ${context} 

      Answer:
    `
  }, { configurable: { sessionId: chatId } })
}

function getHistoryFromMessages(messasges: Message[]) {
  const messageHistory = new ChatMessageHistory()

  messasges.forEach(({ type, content }) => {
    type === 'assistant'
      ? messageHistory.addAIMessage(content)
      : type === 'user'
        ? messageHistory.addUserMessage(content)
        : null
  })

  return messageHistory;
}
import { ChatOpenAI } from "@langchain/openai"
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
  } from "@langchain/core/prompts"
import { RunnableWithMessageHistory } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory"
import { Message } from "../types"

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
const chain = historyPromptTemplate.pipe(llm).pipe(stringOutputParser)

export async function respondToUserMessage(message: Message, previousMessages: Message[], chatId = '') {
    const chainWithHistory = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: () => getHistoryFromMessages(previousMessages),
        inputMessagesKey: "message",
        historyMessagesKey: "history",
        });

    return chainWithHistory.invoke({message: message.content}, {configurable: { sessionId: chatId }})
}

function getHistoryFromMessages(messasges: Message[]) {
    const messageHistory = new ChatMessageHistory()
    
    messasges.forEach(({role, content}) => {
        role === 'assistant' 
            ? messageHistory.addAIMessage(content) 
            : role === 'user' 
            ? messageHistory.addUserMessage(content) 
            : null
    })

    return messageHistory;
}
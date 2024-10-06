import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory"
import { Message } from "../types"
import { ChatAgent } from "../agents/chat-agent"

export async function respondToUserMessage(message: Message, previousMessages: Message[], chatId = '') {
  const messages = await getHistoryFromMessages(previousMessages).getMessages();
  const chatAgent = await ChatAgent.createAgent();
  const stream = await chatAgent.stream({input: message.content, chatHistory: messages});

  async function* outputStream() {
    for await (const chunk of stream) {
      console.log('agent stream chunk: ', chunk);
      if (chunk?.output) {
        yield chunk.output;
      }
    }
  }

  return outputStream();
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
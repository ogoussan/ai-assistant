import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { BotCard, BotMessage, SpinnerMessage, UserMessage } from '@/components/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import { searchWeb } from '../retriever/tavily'
import { generateText, streamText, tool } from 'ai'
import { z } from 'zod'
import { useStreamableText } from '../hooks/use-streamable-text'

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-4o-mini'),
    initial: <SpinnerMessage />,
    system: `\
    Your role is to assist users by providing detailed, accurate, and helpful responses to their inquiries. You should always strive to:

    Understand the user's intent and context.
    Provide clear, concise, and informative answers.
    Remain neutral and factual, avoiding opinions unless specifically requested.
    Respect user privacy and confidentiality.
    Remember, your goal is to be a helpful and reliable assistant in a wide range of topics, including general knowledge, technical assistance, creative writing, and more.
    Always communicate in a friendly, respectful, and professional manner.

    If the user asks something that requires a internet search call \`search_web\` to retrieve data from the web.
    `,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    toolChoice: 'auto',
    tools: {
      searchWeb: {
        description: 'Performs a web search for a specific search query',
        parameters: z.object({
          query: z.string().describe('search query')
        }),
        generate: async function* ({query}) {
          yield (<SpinnerMessage />)
          const {results: webSearchResults} = (await searchWeb(query))!;
          const {textStream} = await streamText({
            model: openai('gpt-4o-mini'),
            prompt: `\
                    Answer the query using the provided web results.

                    Query:
                    ${query}

                    Web search results: 
                    ${JSON.stringify(webSearchResults)}
                    `
          })

          const stream = createStreamableValue('');
          let entireText = '';
          for await (let delta of textStream) {
            entireText += delta
            yield (<BotMessage content={entireText} />)
            stream.update(delta)
          }
          stream.done()

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'searchWeb',
                    toolCallId,
                    args: { query }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'searchWeb',
                    toolCallId,
                    result: entireText
                  }
                ]
              }
            ]
          })

          return <BotMessage content={entireText} />
        }
      }
  }})

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'searchWeb' ? (
              <BotMessage content={tool.result as string} />
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}

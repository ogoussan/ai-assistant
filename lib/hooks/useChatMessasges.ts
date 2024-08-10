import { getChat, saveChat, submitUserMessage } from "@/app/actions";
import { Chat, Message } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useChatMessages(chatId: string, userId?: string) {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        (async () => {
            if (chatId && userId) {
                const chat = await getChat(chatId, userId)
            
                if (chat) {
                    setMessages(chat.messages)
                }
            }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            if (!messages.length || !userId) {
                return
            }
            
            const createdAt = new Date()
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
        })()
    }, [messages])

    async function sendMessage(content: string) {
        const userMessage: Message = {
            id: nanoid(),
            role: 'user',
            content,
        };

        setMessages((previousMessages) => [
            ...previousMessages, 
            userMessage,
        ])

        const assistantMessageContent = await submitUserMessage(userMessage, messages, chatId)
        setMessages((previousMessages) => [
            ...previousMessages,
            {
                id: nanoid(),
                role: 'assistant',
                content: assistantMessageContent,
            }
        ])
    }

    return { messages, sendMessage }
}
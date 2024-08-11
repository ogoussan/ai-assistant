import { getChat, saveChat } from "@/app/actions";
import { Chat, Message } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useChatMessages(chatId: string, userId?: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [streamedResponse, setStreamedResponse] = useState<string | undefined>('')

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

            saveChat(chat);
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

        try {
            const response = await fetch('api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: { content },
                    previousMessages: [],
                    chatId,
                }),
            });
      
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
      
            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');
      
            let done = false;
            let fullText = '';
      
            while (!done) {
                const { value, done: streamDone } = await reader!.read();
                done = streamDone;
                const chunk = decoder.decode(value, { stream: !done });
                setStreamedResponse((prev) => prev + chunk)
                fullText += chunk
            }
            
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: nanoid(),
                    role: 'assistant',
                    content: fullText,
                }
            ])

            setStreamedResponse('');
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    }

    return { messages, sendMessage, streamedResponse }
}
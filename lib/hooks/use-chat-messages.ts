import { getChat, saveChat } from "@/app/actions";
import { Chat, FileData, Message } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { useEffect, useState } from "react";
import { mutate } from 'swr'

export function useChatMessages(chatId: string,  userId?: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [streamedResponse, setStreamedResponse] = useState<string | undefined>('')
    const [isPending, setIsPending] = useState(false)

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
                setIsPending(false) 
                return
            } 
            
            const createdAt = new Date()
            const path = `/chat/${chatId}`


            const [firstMessage, secondMessage] = messages;
            const firstMessageContent = firstMessage.type !== 'file' 
                ? firstMessage.content as string 
                : secondMessage 
                    ? secondMessage.content as string 
                    : (firstMessage.content as { name: string, type: string }).name

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
            setIsPending(false)
        })()
    }, [messages])

    async function sendMessage(content: string, files: FileData[] = []) {
        const id = nanoid()
        console.log(`[UseChatMessage] Sending message with id ${id}`)

        const userMessage: Message = {
            id,
            type: 'user',
            content,
        };

        const fileMessages: Message[] = files.map((file) => ({
            id: nanoid(),
            type: 'file',
            content: {
                name: file.name,
                type: file.type
            }
        })) || []
    
        setMessages((previousMessages) => [
            ...previousMessages,
            ...(content ? [userMessage] : []),
            ...fileMessages,
        ]);

        const formData = new FormData();
        if (files.length > 0) {
            files.forEach((fileData, index) => {
                const fileBlob = new Blob([fileData.arrayBuffer], { type: fileData.type });
                formData.append('files', fileBlob, fileData.name);
            })
        }
        formData.append('message', content)
        formData.append('previousMessages', JSON.stringify(messages))
        formData.append('chatId', chatId)
    
        try {
            const response = await fetch('../api/chat', {
                method: 'POST',
                body: formData,
            });

            console.log('response', response)
    
            if (!response || !response.ok) {
                throw new Error('Network response was not ok')
            }
    
            const reader = response.body?.getReader()
            const decoder = new TextDecoder('utf-8')
    
            let done = false
            let fullText = ''

            setIsPending(true)
    
            while (!done) {
                const { value, done: streamDone } = await reader!.read();
                done = streamDone;
                const chunk = decoder.decode(value, { stream: !done });
                setStreamedResponse((prev) => prev + chunk);
                fullText += chunk;
            }

            console.log('[UseChatMessages] Stream of response assistant message completed')
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: nanoid(),
                    type: 'assistant',
                    content: fullText,
                }
            ]);
            await mutate(`chats/${userId}`);

            setStreamedResponse('');
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    }

    return { messages, sendMessage, streamedResponse, isPending }
}
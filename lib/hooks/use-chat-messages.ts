import { getChat, saveChat } from "@/app/actions";
import { Chat, FileData, Message } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useChatMessages(chatId: string,  userId?: string) {
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
            
            saveChat(chat);
        })()
    }, [messages])

    async function sendMessage(content: string, files: FileData[] = []) {
        const userMessage: Message = {
            id: nanoid(),
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
        formData.append('userId', userId || '')
        formData.append('previousMessages', JSON.stringify(messages))
        formData.append('chatId', chatId)
    
        try {
            const response = await fetch('api/chat', {
                method: 'POST',
                body: formData,
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
                setStreamedResponse((prev) => prev + chunk);
                fullText += chunk;
            }
    
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    id: nanoid(),
                    type: 'assistant',
                    content: fullText,
                }
            ]);
    
            setStreamedResponse('');
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    }

    return { messages, sendMessage, streamedResponse }
}
import { NextResponse } from "next/server";
import { respondToUserMessage } from "@/lib/assistant/chat-completion";
import { nanoid } from "@/lib/utils";
import { FileData, Message } from "@/lib/types";
import { uploadFile } from "@/lib/knowledge-base/s3";
import { stackServerApp } from "@/stack";
import { loadFile } from "@/lib/loaders";
import { addDocuments } from "@/lib/knowledge-base/pinecone";

export const POST = async (request: Request) => {

    const user = await stackServerApp.getUser()

    try {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            const previousMessages = JSON.parse(formData.get('previousMessages') as string) as Message[]
            const chatId = formData.get('chatId') as string
            const files = formData.getAll('files') as Blob[]

            await Promise.all(files.map(async (blobFile) => {
                const file: FileData = {
                    key: user?.id || '',
                    arrayBuffer: await blobFile!.arrayBuffer(),
                    name: (blobFile as any).name,
                    type: blobFile.type,
                }

                if (user?.id) {
                    const result = await uploadFile(file, user?.id)
                    const documents = await loadFile(blobFile)
                    const documentsIds = documents.map((_, index) => `${file.name}-${nanoid()}#${index}`)
                    console.log('File uploaded successfully:', result)
                    await addDocuments(documents, documentsIds)
                    console.log('File was successfully digested')
                }
            }))
        
            const message: Message = {
                id: nanoid(),
                type: 'user',
                content: formData.get('message')  as string
            }
            
            const stream = await respondToUserMessage(message, previousMessages, chatId)
            const readableStream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of stream) {
                        console.log('chunk: ', chunk)
                        controller.enqueue(chunk);
                    }
                    controller.close();
                },
                cancel() {
                    console.log('Stream cancelled');
                }
            });

            return new Response(readableStream, {
                headers: { 'Content-Type': 'text/plain' }
            });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
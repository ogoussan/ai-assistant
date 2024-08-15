import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { respondToUserMessage } from "@/lib/assistant/chat-completion";
import { nanoid } from "@/lib/utils";
import { Message } from "@/lib/types";

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            
            const previousMessages = JSON.parse(formData.get('previousMessages') as string) as Message[]
            const chatId = formData.get('chatId') as string
            const files = formData.getAll('files') as Blob[]

            let documents;

            if (files.length > 0) {
                const pdfFile = files.find(file => file.type === 'application/pdf');
                if (pdfFile) {
                    const arrayBuffer = await pdfFile.arrayBuffer();
                    const loader = new WebPDFLoader(new Blob([arrayBuffer], { type: 'application/pdf' }));
                    documents = await loader.load();
                    console.log(documents[0])
                } else {
                    return NextResponse.json({ message: 'Invalid file type. Please upload a PDF.' }, { status: 400 });
                }
            }

            const message: Message = {
                id: nanoid(),
                role: 'user',
                content: `${formData.get('message') as string} ${files.length 
                    ? 'use this file content as context: ' + documents[0].pageContent 
                    : ''
                }`,
            }

            const stream = await respondToUserMessage(message, previousMessages, chatId)
            const readableStream = new ReadableStream({
                async start(controller) {
                    for await (const chunk of stream) {
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
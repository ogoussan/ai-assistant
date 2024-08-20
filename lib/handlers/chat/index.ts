import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { respondToUserMessage } from "@/lib/assistant/chat-completion";
import { nanoid } from "@/lib/utils";
import { FileData, Message } from "@/lib/types";
import { Document } from "langchain/document";
import { uploadFile } from "@/lib/knowledge-base/s3";

const MAX_FILE_CONTENT_LENGTH = 20_000

export const chatHandler = async (request: Request) => {
    try {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            const previousMessages = JSON.parse(formData.get('previousMessages') as string) as Message[]
            const chatId = formData.get('chatId') as string
            const userId = formData.get('userId') as string
            const files = formData.getAll('files') as Blob[]

            let documents: Document[] = [];

            if (files.length > 0) {
                const pdfFile = files.find(file => file.type === 'application/pdf');
                const fileName = (pdfFile as any).name;
                const file: FileData = {
                    arrayBuffer: await pdfFile!.arrayBuffer(),
                    name: fileName,
                    type: 'application/pdf',
                }

                if (pdfFile) {
                    const arrayBuffer = await pdfFile.arrayBuffer()
                    const loader = new WebPDFLoader(new Blob([arrayBuffer], { type: 'application/pdf' }))
                    documents = await loader.load()

                    if (userId) {
                        const result = await uploadFile(file, userId)
                        console.log('File uploaded successfully:', result)
                    }
                    
                } else {
                    return NextResponse.json(
                        { message: 'Invalid file type. Please upload a PDF.' },
                        { status: 400 }
                    )
                }
            }

            const fullText = (documents.map(({pageContent}) => pageContent) as string[]).join()
            const message: Message = {
                id: nanoid(),
                type: 'user',
                content: `${formData.get('message') as string} ${files.length && documents[0]?.pageContent
                    ? 'use this file content as context: ' + fullText.substring(0, MAX_FILE_CONTENT_LENGTH)
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
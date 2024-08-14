import { respondToUserMessage } from "@/lib/assistant/chat-completion";
import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get('Content-Type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            const message = formData.get('message') as string;
            const files = formData.getAll('files') as Blob[];

            let document;
            if (files.length > 0) {
                const pdfFile = files.find(file => file.type === 'application/pdf');
                if (pdfFile) {
                    const arrayBuffer = await pdfFile.arrayBuffer();
                    const loader = new WebPDFLoader(new Blob([arrayBuffer], { type: 'application/pdf' }));
                    document = await loader.load();
                    console.log(document)
                } else {
                    return NextResponse.json({ message: 'Invalid file type. Please upload a PDF.' }, { status: 400 });
                }
            }

            return NextResponse.json({
                message: 'File processed successfully',
                document,
                userMessage: message,
            });

        } else {
            const { message, previousMessages, chatId } = await request.json();
            const stream = await respondToUserMessage(message, previousMessages, chatId);

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
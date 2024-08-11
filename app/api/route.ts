import { respondToUserMessage } from "@/lib/ai/chat-completion";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { message, previousMessages, chatId } = await request.json();

    try {
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
    } catch (error) {
        console.error('Error processing message:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
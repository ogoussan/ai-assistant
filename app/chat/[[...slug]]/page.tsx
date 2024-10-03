import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { getMissingKeys } from '@/app/actions'
import { stackServerApp } from '@/stack'
import { redirect } from 'next/navigation'
import ContentContainer from '@/components/content-container'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function ChatPage() {
    // TODO: Fetch id from params
    const id = nanoid()
    const missingKeys = await getMissingKeys()
    const user = await stackServerApp.getUser()

    if (!user) {
        redirect(`/handler/signin`)
    }

    return (
        <ContentContainer isAuthenticated>
            <Chat id={id} missingKeys={missingKeys} userId={user?.id} />
        </ContentContainer>
    )
}
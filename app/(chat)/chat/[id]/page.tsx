import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { Session } from '@/lib/types'
import { stackServerApp } from '@/stack'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const user = await stackServerApp.getUser()

  if (!user) {
    return {}
  }

  const chat = await getChat(params.id, user.id)
  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const missingKeys = await getMissingKeys()
  const user = await stackServerApp.getUser({or: 'redirect'})

  if (!user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = user?.id as string
  const chat = await getChat(params.id, userId)

  if (!chat) {
    redirect('/')
  }

  if (chat?.userId !== user?.id) {
    notFound()
  }

  return (
    <Chat
      id={chat?.id}
      missingKeys={missingKeys}
    />
  )
}

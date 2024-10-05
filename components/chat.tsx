'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { FileData } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useChatMessages } from '@/lib/hooks/use-chat-messages'
import { useUser } from '@stackframe/stack'

export interface ChatProps extends React.ComponentProps<'div'> {
  id: string
  userId?: string
  missingKeys: string[]
}

export function Chat({ id, className, userId, missingKeys }: ChatProps) {
  const user = useUser()

  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const { messages, sendMessage, streamedResponse, isPending } = useChatMessages(id, userId)
  const [isRespondLoading, setIsRespondLoading] = useState(false)

  const _sendMessage = async (content: string, files?: FileData[]) => {
    setIsRespondLoading(true)
    await sendMessage(content, files)
    setIsRespondLoading(false)
  }

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (user) {
      if (!path.includes('chat') && messages.length === 1) {
        console.log(`[Chat] Navigate to new chat with id ${id}`)
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, user, messages])

  useEffect(() => {
    const messagesLength = messages?.length
    if (messagesLength === 2 && !isPending) {
      router.refresh()
    }

  }, [messages, router, isPending])

  useEffect(() => {
    setNewChatId(id)
  }, [id])

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  useEffect(() => {
    scrollToBottom()
  }, [streamedResponse])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } = useScrollAnchor()

  return (
    <div
      className="flex-1 flex flex-col"
      ref={scrollRef}
    >
      <div
        className={cn('flex flex-col', className)}
        ref={messagesRef}
      ></div>
      <ChatList messages={messages} streamedResponse={streamedResponse} isShared={false} isLoading={isRespondLoading} />
      <div className="w-full h-px" ref={visibilityRef} />
      <ChatPanel
        id={id}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={_sendMessage}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  )
}

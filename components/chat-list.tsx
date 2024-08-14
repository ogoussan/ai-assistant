import { Separator } from '@/components/ui/separator'
import { Message, Session } from '@/lib/types'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { renderMessage } from './message'
import { useMemo } from 'react'
import { nanoid } from 'nanoid'

export interface ChatList {
  messages: Message[]
  streamedResponse?: string
  session?: Session
  isShared: boolean
}

export function ChatList({ messages = [], session, isShared, streamedResponse }: ChatList) {
 const messagesWithStreamedResponse = useMemo(() => (streamedResponse ? [...messages, {id: nanoid(), role: 'assistant', content: streamedResponse}] : messages), [streamedResponse])

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isShared && !session ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/login" className="underline">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/signup" className="underline">
                  sign up
                </Link>{' '}
                to save and revisit your chat history!
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {messagesWithStreamedResponse.map((message, index) => (
        <div key={message.id}>
          {renderMessage(message.role, message.content as string)}
          {index < messagesWithStreamedResponse.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
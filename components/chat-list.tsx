import { Separator } from '@/components/ui/separator'
import { Message } from '@/lib/types'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { renderMessage, SpinnerMessage } from './message'
import { useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useUser } from '@stackframe/stack'

export interface ChatList {
  messages: Message[]
  streamedResponse?: string
  isShared: boolean
  isLoading?: boolean
}

export function ChatList({ messages = [], isShared, streamedResponse, isLoading }: ChatList) {
 const messagesWithStreamedResponse = useMemo(() => (streamedResponse ? [...messages, {id: nanoid(), type: 'assistant', content: streamedResponse}] : messages), [streamedResponse, messages])
 const user = useUser()

  return (
    <div className="p-8">
      {!isShared && !user ? (
        <>
          <div className="group relative mb-4 flex items-start">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/handler/signin" className="underline">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/handler/signup" className="underline">
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
          {renderMessage(message.type, message.content as string)}
          {index < messagesWithStreamedResponse.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
      { isLoading && !streamedResponse && <><Separator className="my-4" /><SpinnerMessage /></>}
    </div>
  )
}
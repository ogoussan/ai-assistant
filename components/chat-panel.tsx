import * as React from 'react'

import { shareChat } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconShare } from '@/components/ui/icons'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { FileData, Message } from '@/lib/types'

export interface ChatPanelProps {
  id?: string
  title?: string
  messages: Message[]
  input: string
  setInput: (value: string) => void
  sendMessage: (content: string, files: FileData[]) => Promise<void>
  isAtBottom: boolean
  scrollToBottom: () => void
}

export function ChatPanel({
  id,
  title,
  messages,
  input,
  setInput,
  sendMessage: sendUserMessage,
  isAtBottom,
  scrollToBottom
}: ChatPanelProps) {
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)

  const exampleMessages = [
    {
      heading: 'Plan a healthy meal',
      subheading: 'for a week that includes breakfast, lunch, and dinner.',
      message: `Can you help me plan a healthy meal for a week that includes breakfast, lunch, and dinner?`
    },
    {
      heading: 'Create a budget',
      subheading: 'for saving for a vacation in the next year.',
      message: `Can you help me create a budget for saving for a vacation in the next year?`
    },
    {
      heading: 'Organize a workout routine',
      subheading: 'to improve fitness over the next three months.',
      message: `Can you help me organize a workout routine to improve my fitness over the next three months?`
    },
    {
      heading: 'Develop a study plan',
      subheading: 'for preparing for an upcoming exam.',
      message: `Can you help me develop a study plan for preparing for my upcoming exam?`
    }
  ];

  return (
    <>
      <div className="sticky inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
        <ButtonScrollToBottom
          isAtBottom={isAtBottom}
          scrollToBottom={scrollToBottom}
        />
        <div className="mx-auto sm:max-w-2xl sm:px-4">
          <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
            {messages.length === 0 &&
              exampleMessages.map((example, index) => (
                <div
                  key={example.heading}
                  className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${index > 1 && 'hidden md:block'
                    }`}
                  onClick={async () => {
                    await sendUserMessage(example.message, [])
                  }}
                >
                  <div className="text-sm font-semibold">{example.heading}</div>
                  <div className="text-sm text-zinc-600">
                    {example.subheading}
                  </div>
                </div>
              ))}
          </div>

          {messages?.length >= 2 ? (
            <div className="flex h-12 items-center justify-center">
              <div className="flex space-x-2">
                {id && title ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShareDialogOpen(true)}
                    >
                      <IconShare className="mr-2" />
                      Share
                    </Button>
                    <ChatShareDialog
                      open={shareDialogOpen}
                      onOpenChange={setShareDialogOpen}
                      onCopy={() => setShareDialogOpen(false)}
                      shareChat={shareChat}
                      chat={{
                        id,
                        title,
                        messages
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
            <PromptForm input={input} setInput={setInput} sendUserMessage={sendUserMessage} />
          </div>
        </div>
      </div>
    </>
  )
}

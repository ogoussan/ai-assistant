'use client'

import { Chat } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { removeChat, shareChat } from '@/app/actions'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { mutate } from 'swr'
import { useUser } from '@stackframe/stack'

interface SidebarItemsProps {
  chats?: Chat[]
}

export function SidebarItems({ chats = [] }: SidebarItemsProps) {
  if (!chats?.length) return null

  const user = useUser();

  const handleRemoveChat = (chatData: {id: string, path: string}) => {
    return removeChat(chatData).then(() => {
      mutate(`chats/${user?.id}`)
    })
  }

  return (
    <AnimatePresence>
      {chats.map(
        (chat, index) =>
          chat && (
            <motion.div
              key={chat?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <SidebarItem index={index} chat={chat}>
                <SidebarActions
                  chat={chat}
                  removeChat={handleRemoveChat}
                  shareChat={shareChat}
                />
              </SidebarItem>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}

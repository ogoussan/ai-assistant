import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { useUser } from '@stackframe/stack'
import { cache, useEffect, useState } from 'react'
import useSwr from 'swr'
import { IconSpinner } from './ui/icons'

const loadChats = cache(async (userId?: string) => {
  return await getChats(userId)
})

export function SidebarList() {
  const user = useUser();
  const { data: chats = [], isLoading } = useSwr(`chats/${user?.id}`, () => loadChats(user?.id));

  if (isLoading) {
    <div className="flex-1 flex items-center justify-center">
      <IconSpinner className="size-12" />
    </div>
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}

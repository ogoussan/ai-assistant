import * as React from 'react'
import Link from 'next/link'

import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import {
  IconNextChat,
  IconSeparator,
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'
import { FolderIcon } from "lucide-react";
import { FileExplorer } from "./file-explorer/file-explorer";

async function HistorySidebar() {
  const session = (await auth()) as Session
  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  )
}

async function FileExplorerSidebar({ userId }: {userId?: string}) {
  return userId ? (
    <SidebarMobile icon={<FolderIcon />} side="right">
      <FileExplorer  userId={userId}/>
    </SidebarMobile>
  ) : (<FolderIcon className='opacity-50 cursor-not-allowed' />)
}

export async function Header() {
  const session = await auth()
  const userId = session?.user?.id  

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <HistorySidebar />
        </React.Suspense>
      </div>
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <FileExplorerSidebar userId={userId} />
      </React.Suspense>
    </header>
  )
}

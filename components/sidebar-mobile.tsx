'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'

import { IconSidebar } from '@/components/ui/icons'

interface SidebarMobileProps {
  children: React.ReactNode
  icon?: React.ReactNode
  side?: 'left' | 'right',
  width?: number,
}

export function SidebarMobile({ children, icon, side = 'left' }: SidebarMobileProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="-ml-2 flex size-9 p-0">
          {icon ? icon : <IconSidebar className="size-6" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side={side}
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  )
}

'use client';
import * as React from 'react';
import Link from 'next/link';
import { Folders, MessageCirclePlus, PanelLeft, SquarePen } from 'lucide-react';
import { UserButton } from '@stackframe/stack';

interface HeaderProps {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  showItems?: boolean;
}

export function Header({toggleLeftPanel, toggleRightPanel, showItems}: HeaderProps) {
  console.log('Header', showItems)
  return (
    <header className={`w-screen z-50 flex items-center ${showItems ? 'justify-between' : 'justify-center'} h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl`}>
      {showItems && (
        <div className="flex gap-2">
        <div
          onClick={toggleLeftPanel} 
          className="p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <PanelLeft />
        </div>
        <div title="New Chat" className="p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <MessageCirclePlus />
        </div>
      </div>
      )}
      <Link href="/">
        <div className="text-lg p-2 rounded hover:bg-accent hover:text-accent-foreground">
          Assistant
        </div>
      </Link>
      {showItems && (
         <div className="flex items-center gap-2"> 
         <div
           onClick={toggleRightPanel}  
           className="flex flex-row gap-4 items-center p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
           <Folders />
         </div>
         <div className="w-[40px] flex"><UserButton /></div>
       </div>
      )}
    </header>
  )
}

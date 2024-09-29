'use client';
import * as React from 'react';
import Link from 'next/link';
import { Folders, MessageCirclePlus, PanelLeft, SquarePen } from 'lucide-react';

interface HeaderProps {
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

export function Header({toggleLeftPanel, toggleRightPanel}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
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
      <Link href="/">
        <div className="text-lg p-2 rounded hover:bg-accent hover:text-accent-foreground">
          Assistant
        </div>
      </Link>
      <div className="flex gap-2">
        <div className="w-[40px]"></div>  
        <div
          onClick={toggleRightPanel}  
          className="p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <Folders />
        </div> 
      </div>
    </header>
  )
}

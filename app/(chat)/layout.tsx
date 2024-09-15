import { SidebarDesktop } from '@/components/sidebar-desktop'
import { Toaster } from 'sonner'


interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      {children}
      <Toaster richColors position="top-center" />
    </div>
  )
}

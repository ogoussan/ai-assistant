import ContentContainer from '@/components/content-container'
import { Toaster } from 'sonner'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <>
      <ContentContainer isAuthenticated>
          {children}
      </ContentContainer>
      <Toaster richColors position="top-center" />
    </>
  )
}

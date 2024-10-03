import ContentContainer from '@/components/content-container'
import { Toaster } from 'sonner'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: ChatLayoutProps) {
  return (
     <ContentContainer containerClassName='flex flex-1 w-screen justify-center [&>*]:flex-1'>
        {children}
    </ContentContainer>
  )
}

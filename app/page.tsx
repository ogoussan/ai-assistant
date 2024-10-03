import { stackServerApp } from '@/stack'
import { redirect } from 'next/navigation'
import { IconSpinner } from '@/components/ui/icons'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect(`/handler/signin`)
  } else {
    redirect('/chat')
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <IconSpinner className="size-12" />
    </div>
  )
}

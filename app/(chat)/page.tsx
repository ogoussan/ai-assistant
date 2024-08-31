import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { getMissingKeys } from '@/app/actions'
import { stackServerApp } from '@/stack'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const id = nanoid()
  const missingKeys = await getMissingKeys()
  const user = await stackServerApp.getUser()

  return (
    <Chat id={id} missingKeys={missingKeys} userId={user?.id} />
  )
}

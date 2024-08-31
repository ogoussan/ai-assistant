'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'
import { stackServerApp } from '@/stack'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  console.log(`[app/actions]: Fetching chats of user with id: ${userId}`)
  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()
    console.log(`[app/actions]: Chat fetch result: ...`) 

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  console.log(`[app/actions - getChat]: Fetching chat with id: ${id}`)
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    console.log(`[app/actions - getChat]: No chat with id ${id} found for current user`)

    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  console.log(`[app/actions removeChat]: Removing chat with id ${id} `)

  const user = await stackServerApp.getUser()

  if (!user) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with user.id
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  console.log('[app/actions - clearChat]: Clearing chat')
  const user = await stackServerApp.getUser({or: 'redirect'})

  if (user.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  console.log(`[app/actions - getSharedChat]: Fetching shared chat for id ${id}`)
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  console.log(`[app/actions - shareChat]: Sharing chat with id ${id}`)
  const user = await stackServerApp.getUser()

  if (!user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function saveChat(chat: Chat) {
  const user = await stackServerApp.getUser()
  console.log(`[app/actions - saveChat]: Saving chat ${chat}`)

  if (user) {
    const pipeline = kv.pipeline()
    pipeline.hmset(`chat:${chat.id}`, chat)
    pipeline.zadd(`user:chat:${chat.userId}`, {
      score: Date.now(),
      member: `chat:${chat.id}`
    })
    await pipeline.exec()
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  console.log('[app/actions] Refreshing history')
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}

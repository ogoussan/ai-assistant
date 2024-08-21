'use server'

import { auth } from "@/auth"
import { listUserFiles, moveFile } from "@/lib/knowledge-base/s3"
import { FileData } from "@/lib/types"
import { Session } from "next-auth"

export async function listFiles(): Promise<FileData[]> {
  const session = (await auth()) as Session
  const userId = session.user?.id

  return (userId 
    ?  ((await listUserFiles(userId)).filter(Boolean)).map((file: FileData) => file) 
    : [])
}

export async function moveFiles(oldPaths: string[], newPath: string) {
  console.log(oldPaths, newPath)
  
  return Promise.all(oldPaths.map((oldPath) => moveFile(oldPath, newPath)))
}


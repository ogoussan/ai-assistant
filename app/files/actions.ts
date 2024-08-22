'use server'

import { auth } from "@/auth"
import { fetchFileStructure, moveFile } from "@/lib/knowledge-base/s3"
import { Folder } from "@/lib/types"
import { Session } from "next-auth"


export async function fetchRootFolder(): Promise<Folder> {
  const session = (await auth()) as Session
  const userId = session.user?.id
  const emptyFolder = {
    name: 'home',
    path: 'home',
    files: [],
    subfolders: [],
  }

  if (!userId) return emptyFolder

  return fetchFileStructure(userId)
}

export async function moveFiles(oldPaths: string[], newPath: string) {
  console.log(oldPaths, newPath)
  
  return Promise.all(oldPaths.map((oldPath) => moveFile(oldPath, newPath)))
}


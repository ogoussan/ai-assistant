import { clsx, type ClassValue } from 'clsx'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'
import { FileData, Folder } from './types'
import { Slice } from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
)

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return 'Invalid credentials!'
    case ResultCode.InvalidSubmission:
      return 'Invalid submission, please try again!'
    case ResultCode.UserAlreadyExists:
      return 'User already exists, please log in!'
    case ResultCode.UserCreated:
      return 'User created, welcome!'
    case ResultCode.UnknownError:
      return 'Something went wrong, please try again!'
    case ResultCode.UserLoggedIn:
      return 'Logged in!'
  }
}

export const getFileNameWithExtensionFromKey = (fileKey: string) => fileKey
.split('/')
.pop()?.slice(1, -1)


export const formatFileNameFromKey = (fileKey: string) => getFileNameWithExtensionFromKey(fileKey)
  ?.split('.').slice(0, -1).join('.') 

export const getFileExtensionFromKey = (fileKey: string) => getFileNameWithExtensionFromKey(fileKey)
  ?.split('.').pop()

export const getPathNodeAtDepth = (key: string, layer: number): string | undefined => key.split('/')[layer+1]

export const aggregateFoldersRecursively = (files: FileData[], depth = 0, path = '/home'): Folder => {
  const fileNamePattern = /\[([^[]*)\]/g;
  const isFile = (fileKey: string, pathDepth: number) => !!getPathNodeAtDepth(fileKey, pathDepth)?.match(fileNamePattern)?.length
  const isFolder = (fileKey: string, pathDepth: number) => !!getPathNodeAtDepth(fileKey, pathDepth) && !isFile(fileKey, pathDepth)
  const aggregatedFolders: string[] = []

  const depthFolders = files.filter((file) => isFolder(file.key, depth)).map((file) => {
    const folderName = getPathNodeAtDepth(file.key, depth)

    if (folderName && aggregatedFolders.includes(folderName)) {
      return null
    } else if (folderName) {
      aggregatedFolders.push(folderName)
    }

    const isInFolder = (folderFile: FileData) => folderName 
      && folderFile.key.split('/').includes(folderName) 
      && folderFile.key.split('/').length > depth + 1

    const filesInFolder = files.filter((folderFile) => isInFolder(folderFile))

    return aggregateFoldersRecursively(filesInFolder, depth + 1, `${path}/${folderName}`)
  }).filter(Boolean)

  const depthFiles = files.filter(file => isFile(file.key, depth))
  console.log('folders', depthFolders)

  return {name: getPathNodeAtDepth(path, depth)!, path, files: depthFiles, subfolders: depthFolders}
}

export const getFolderFromPath = (rootFolder: Folder, path: string[]): Folder | undefined => {
  let currentFolder: Folder | undefined = rootFolder;

  path.forEach((route) => {
    currentFolder = currentFolder!.subfolders.find((folder) => folder.name === route)

    if (!currentFolder) {
      return rootFolder;
    }
  })

  return currentFolder;
}
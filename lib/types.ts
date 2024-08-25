import { FileExplorer } from "@/components/file-explorer"

export type Message = {
  id: string
  type: 'system' | 'user' | 'assistant' | 'tool'
  content: string
} | { 
  id: string, 
  type: 'file'
  content: { name: string, type: string }
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

interface WebSearchSite {
  title: string,
  content: string,
  url: string,
  score: number,
}

export interface WebSearchResult {
  query: string,
  results: WebSearchSite[]
}

export interface FileData {
  key: string,
  name: string,
  type: string,
  arrayBuffer: ArrayBuffer,
}

interface FileExplorerBase {
  type: 'file' | 'folder',
  path: string,
  name: string,
}

export interface FileExplorerFile extends FileExplorerBase {
  type: 'file'
}

export interface FileExplorerFolder extends FileExplorerBase {
  type: 'folder'
  files: FileExplorerFile[]
  folders: FileExplorerFolder[]
}

export type FileExplorerItem = FileExplorerFolder | FileExplorerFile

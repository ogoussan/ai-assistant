'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconCloudUpload, IconPaperClip } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { FilePreview } from './file-preview'
import { FileData } from '@/lib/types'
import { FileDropOver } from './file-drop-over'

export function PromptForm({
  input,
  setInput,
  sendUserMessage: sendMessage
}: {
  input: string
  setInput: (value: string) => void
  sendUserMessage: (content: string) => Promise<void>
}) {
  const [files, setFiles] = React.useState<FileData[]>([])
  const [isDragging, setIsDragging] = React.useState(false);
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)


  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleDragEnter = () => {
   setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (fileData: FileData) => {
    setIsDragging(false)
    setFiles((prev) => [...prev, fileData])
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const { name, type } = file;
      const arrayBuffer = await file.arrayBuffer()
      const fileData = { name, arrayBuffer, type }
      setFiles((prev) => [...prev, fileData])
    }
  }

  const removeFile = (index: number) => {
    setFiles(() => files.filter((_, i) => index !== i))
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={async (e: any) => {
          e.preventDefault()

          if (window.innerWidth < 600) {
            e.target['message']?.blur()
          }

          const value = input.trim()
          setInput('')
          if (!value) return

          sendMessage(value)
        }}
      >
        <div className="flex gap-4 px-4 overflow-x-scroll">
          {files.map(({ arrayBuffer, name, type }, index) => (<FilePreview key={index} arrayBuffer={arrayBuffer} name={name} type={type} onClose={() => removeFile(index)} />))}
        </div>
        <div className="relative flex flex-row items-end gap-4 max-h-60 w-full grow overflow-hidden bg-background px-4 py-4 sm:rounded-md">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="application/pdf,image/*,text/plain,text/javascript"
            onChange={handleFileChange}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-full bg-background p-0 sm:left-4"
                onClick={() => {
                  fileInputRef.current?.click()
                }}
              >
                <IconPaperClip />
                <span className="sr-only">Upload document</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload document</TooltipContent>
          </Tooltip>
          <Textarea
            ref={inputRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            placeholder="Send a message."
            className="min-h-[60px] w-full resize-none bg-transparent px-2 py-[1.3rem] focus-within:outline-none sm:text-sm rounded-md sm:border"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={input === ''}>
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </form>
      <FileDropOver open={isDragging} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop} />
    </>
  )
}
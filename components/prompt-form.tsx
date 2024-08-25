import * as React from 'react';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { IconArrowElbow, IconPaperClip } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { FilePreview } from './file-preview';
import { FileData } from '@/lib/types';
import { FileDropOver } from './file-drop-over';
import { supportedFileTypes } from '@/constants/supported-file-types';

export function PromptForm({
  input,
  setInput,
  sendUserMessage: sendMessage
}: {
  input: string;
  setInput: (value: string) => void;
  sendUserMessage: (content: string, files: FileData[]) => Promise<void>;
}) {
  const [files, setFiles] = React.useState<FileData[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (fileData: FileData) => {
    setIsDragging(false);
    setFiles((prev) => [...prev, fileData]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const file = e.target.files?.[0];
    if (file) {
      const { name, type } = file;
      const arrayBuffer = await file.arrayBuffer();
      const fileData = { name, arrayBuffer, type, key: '' };
      setFiles((prev) => [...prev, fileData]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(() => files.filter((_, i) => index !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (window.innerWidth < 600) {
      e.currentTarget['message']?.blur();
    }

    const value = input.trim();
    if (!value && files.length === 0) return
    const selectedFiles = files
    setInput('')
    setFiles([])

    await sendMessage(value, selectedFiles)
  };

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="flex gap-4 px-4 overflow-x-scroll">
          {files.map(({ arrayBuffer, name, type }, index) => (
            <FilePreview key={index} arrayBuffer={arrayBuffer!} name={name} type={type} onClose={() => removeFile(index)} />
          ))}
        </div>
        <div className="relative flex flex-row items-end gap-4 max-h-60 w-full grow overflow-hidden bg-background px-4 py-4 sm:rounded-md">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept={supportedFileTypes.join(',')}
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="size-8 rounded-full bg-background p-0 sm:left-4"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <IconPaperClip />
            <span className="sr-only">Upload document</span>
          </Button>
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
            onChange={(e) => setInput(e.target.value)}
          />
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={input === '' && files.length === 0}>
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
  );
}
import * as React from 'react';
import { useState, useEffect } from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileData, FileExplorerFile, Language } from '@/lib/types';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { PdfViewer } from './pdf-viewer';
import { Skeleton } from '../ui/skeleton';
import { getPathFileExtension } from '@/lib/path.helper';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { uploadFile } from '@/lib/knowledge-base/s3'; // Import uploadFile
import "@uiw/react-textarea-code-editor/dist.css";
import { useUser } from '@stackframe/stack';
import { toast } from 'sonner';

interface FileDialogProps extends DialogProps {
  file: FileExplorerFile;
}

export function FileDialog({ file, ...props }: FileDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('plaintext');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const user = useUser();

  useEffect(() => {
    const extension = getPathFileExtension(file.path);

    if (extension === 'pdf') {
      const fetchPdf = async () => {
        try {
          const response = await fetch(`/api/file?path=${encodeURIComponent(file.path)}`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch (error) {
          console.error('Failed to fetch PDF:', error);
        }
      };

      fetchPdf();
    } else {
      const languageMap: { [extension: string]: Language } = {
        js: 'javascript',
        json: 'json',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        html: 'html',
        css: 'css',
        // Add more file extensions as needed
      };

      setLanguage(languageMap[extension] || 'plaintext');

      const fetchFileContent = async () => {
        try {
          const response = await fetch(`/api/file?path=${encodeURIComponent(file.path)}`);
          const text = await response.text();
          setFileContent(text);
          setInitialContent(text); // Set the initial content
        } catch (error) {
          console.error('Failed to fetch file content:', error);
        }
      };

      fetchFileContent();
    }
  }, [file]);

  const handleSave = async () => {
    if (!fileContent) return;

    setIsSaving(true);

    try {
      const fileData = {
        key: file.path,
        name: file.name,
        arrayBuffer: new TextEncoder().encode(fileContent),
        type: 'text/plain',
      } as FileData;
      user && await uploadFile(fileData, user.id); // Replace 'user-id' with the actual userId
      setInitialContent(fileContent)
      toast.success('File saved')
      console.log('File saved successfully!');
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = fileContent !== initialContent;

  return (
    <Dialog {...props}>
      {false && <DialogOverlay />}
      <DialogContent className="max-w-none">
        <DialogTitle>{file.name}</DialogTitle>
        <div className="space-y-1 text-sm border rounded-md">
          {pdfUrl ? (
            <PdfViewer url={pdfUrl} />
          ) : fileContent !== null ? (
            <div className='max-h-[80vh] overflow-y-scroll'>
              <CodeEditor
                value={fileContent}
                language={language}
                placeholder="Please enter code."
                onChange={(evn) => setFileContent(evn.target.value)}
                padding={15}
                style={{
                  fontSize: 12,
                  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
              />
            </div>
          ) : (
            <Skeleton className="h-[80vh] flex items-center justify-center">
              <div className="text-2xl">Loading...</div>
            </Skeleton>
          )}
        </div>
        <DialogFooter className="items-center">
          <Button disabled={!hasUnsavedChanges || isSaving} onClick={handleSave}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button disabled={!pdfUrl && !fileContent}>
            Run Assistant <SparklesIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

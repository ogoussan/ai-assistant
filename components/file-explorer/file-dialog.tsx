'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileExplorerFile, Language } from '@/lib/types';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { PdfViewer } from './pdf-viewer';
import { Skeleton } from '../ui/skeleton';
import { getPathFileExtension } from '@/lib/path.helper';
import { MonacoViewer } from './monaco-viewer';
import { CodeBlock } from '../ui/codeblock';

interface FileDialogProps extends DialogProps {
  file: FileExplorerFile;
}

export function FileDialog({ file, ...props }: FileDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('plaintext');
  const [fileContent, setFileContent] = useState<string | null>(null);

  console.log('language: ', language)

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
        } catch (error) {
          console.error('Failed to fetch file content:', error);
        }
      };

      fetchFileContent();
    }
  }, [file]);

  return (
    <Dialog {...props}>
      {false && <DialogOverlay />}
      <DialogContent className="max-w-none">
        <DialogTitle>{file.name}</DialogTitle>
        <div className="space-y-1 text-sm border rounded-md">
          {pdfUrl ? (
            <PdfViewer url={pdfUrl} />
          ) : fileContent !== null ? (
            <div className='absolute'>
               <CodeBlock language={language} value={fileContent} />
            </div>
          ) : (
            <Skeleton className="h-[80vh] flex items-center justify-center">
              <div className="text-2xl">Loading...</div>
            </Skeleton>
          )}
        </div>
        <DialogFooter className="items-center">
          <Button disabled={!pdfUrl && !fileContent}>
            Run Assistant <SparklesIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

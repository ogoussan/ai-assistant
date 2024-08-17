import React, { FormEvent, useEffect, useState } from 'react';
import { CloseButton } from './close-button';
import { spinner } from './spinner'
import { TurnicatedText } from './turnicate-text';
import { IconFile } from './ui/icons';

interface FilePreviewProps {
    name: string;
    arrayBuffer: ArrayBuffer;
    type: string;
    onClose?: () => void;
}

export function FilePreview({ arrayBuffer, name, type, onClose }: FilePreviewProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        if (arrayBuffer) {
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setFileUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [arrayBuffer]);

    const handleCloseButton = (event: FormEvent<HTMLButtonElement>) => { 
        event.preventDefault()
        onClose?.()
    }

    return (
        <div className='flex flex-col justify-between align-center' style={{ width: '75px' }} title={name}>
            <div className='ml-auto px-1 relative top-4 left-2'>
                <CloseButton onClick={handleCloseButton} />
            </div>
            {fileUrl ? type.includes('pdf') ? (
                <object
                    width='100%'
                    height='100%'
                    style={{ width: '75px', height: '75px', pointerEvents: 'none', borderRadius: 12 }}
                    data={fileUrl}
                    type={type}
                >
                    <TurnicatedText content={name} maxLength={20} />
                </object>
            ) 
            : (
                <div className='flex justify-center items-center bg-muted' style={{ width: '75px', height: '75px', borderRadius: 12 }}>
                    <IconFile />
                </div>
            ) 
            : (
                <>{spinner}</>
            )}
            <p className='text-xs truncate ...' title={name}>{name}</p>
        </div>
    );
}
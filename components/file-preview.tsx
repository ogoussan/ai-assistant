import React, { useEffect, useState } from 'react';
import { CloseButton } from './close-button';
import { spinner } from './spinner'
import { TurnicatedText } from './turnicate-text';

interface FilePreviewProps {
    name: string;
    arrayBuffer: ArrayBuffer;
    type: string;
    onClose?: () => void;
}

export function FilePreview({ arrayBuffer, name, type, onClose }: FilePreviewProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (arrayBuffer) {
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [arrayBuffer]);

    return (
        <div className='flex flex-col justify-between align-center' style={{ width: '75px'}}>
            <div className='ml-auto px-1 relative top-4 left-2'>
                <CloseButton onClick={onClose} />
            </div>
            {pdfUrl ? (
                <object
                    width='100%'
                    height='100%'
                    style={{ width: '75px', height: '75px', pointerEvents: 'none', borderRadius: 12 }}
                    data={pdfUrl}
                    type={type}
                >
                    <TurnicatedText content={name} maxLength={20}/>
                </object>
            ) : (
                <>{spinner}</>
            )}
            <p className='truncate ...'>{name}</p>
        </div>
    );
}
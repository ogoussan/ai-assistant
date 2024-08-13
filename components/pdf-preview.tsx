import React, { useEffect, useState } from 'react';
import { CloseButton } from './close-button';
import { spinner } from './spinner'
import { TurnicatedText } from './turnicate-text';

interface PdfPreviewProps {
    name: string;
    arrayBuffer: ArrayBuffer;
    type: string;
    onClose?: () => void;
}

export function PdfPreview({ arrayBuffer, name, type, onClose }: PdfPreviewProps) {
    console.log(type)
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
        <div className='flex flex-col justify-between align-center' style={{ width: '100px'}}>
            <div className='ml-auto px-1 relative top-7'>
                <CloseButton onClick={onClose} />
            </div>
            {pdfUrl ? (
                <object
                    width='100%'
                    height='100%'
                    style={{ width: '100px', height: '100px', pointerEvents: 'none', borderRadius: 12 }}
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
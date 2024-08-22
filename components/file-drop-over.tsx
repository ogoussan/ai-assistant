import { FormEvent, useEffect } from "react";
import { IconCloudUpload } from "./ui/icons";
import { FileData } from "@/lib/types";

interface FileDropOverProps {
    open: boolean;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDrop: (fileData: FileData) => void;
}

export function FileDropOver({ open, onDragEnter, onDragLeave, onDrop }: FileDropOverProps) {

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            onDragEnter();
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            const relatedTarget = e.relatedTarget as Node;
            const htmlElement = document.querySelector("html");

            // Check if the mouse is truly leaving the drop zone (htmlElement)
            if (relatedTarget && htmlElement && !htmlElement.contains(relatedTarget)) {
                onDragLeave();
            }
        };

        const handleDrop = async (event: DragEvent) => {
            event.preventDefault();

            const files = event.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();

                const fileData: FileData = {
                    key: file.name,
                    arrayBuffer,
                    name: file.name,
                    type: file.type,
                };

                onDrop(fileData);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
        };

        const htmlElement = document.querySelector("html");

        htmlElement?.addEventListener('dragenter', handleDragEnter);
        htmlElement?.addEventListener('dragleave', handleDragLeave);
        htmlElement?.addEventListener('drop', handleDrop);
        htmlElement?.addEventListener('dragover', handleDragOver);

        return () => {
            htmlElement?.removeEventListener('dragenter', handleDragEnter);
            htmlElement?.removeEventListener('dragleave', handleDragLeave);
            htmlElement?.removeEventListener('drop', handleDrop);
            htmlElement?.removeEventListener('dragover', handleDragOver);
        };
    }, [onDragEnter, onDragLeave, onDrop]);

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center pointer-events-none ${open ? 'bg-[#00000096]' : ''}`}
        >
            {open && (
                <div className="flex flex-col gap-2 p-16 items-center border-dashed border bg-background">
                    <IconCloudUpload />
                    <h2 className="text-2xl font-bold">Drop File Here</h2>
                    <p className="text-muted-foreground">Drag and drop a file to upload it.</p>
                </div>
            )}
        </div>
    );
}
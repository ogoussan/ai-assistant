import { useState } from "react";

export function usePDF() {
    const [pdfData, setPdfData] = useState<string[]>([])

    const previewPDF = (arrayBuffer: ArrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob);
        setPdfData((prev) => [...prev, url]);
    }

    const removePreview = (index: number) => {
        setPdfData((prev) => prev.filter((_, i) => i !== index))
    }

    return { previewPDF, removePreview, pdfData }
}
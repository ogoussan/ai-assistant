import { Language } from '@/lib/types';
import { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

export const MonacoViewer = ({defaultValue = '', language = 'javascript'}: {defaultValue: string, language: Language }) => {
    const [value, setValue] = useState(defaultValue)
    const options = {
        selectOnLineNumbers: true,
        autoDetectHighContrast: true,
        minimap: {
            enabled: false
        }
    };

    const handleChange = (newValue: string, event: any) => {
        setValue(newValue)
    }

    return (
        <MonacoEditor
            language={language}
            height='600'
            value={value}
            options={options}
            onChange={handleChange}
            editorDidMount={() => {
                if (window.MonacoEnvironment)
                window.MonacoEnvironment.getWorkerUrl = (
                  _moduleId: string,
                  label: string
                ) => {
                  if (label === "json") return "_next/static/json.worker.js";
                  if (label === "css") return "_next/static/css.worker.js";
                  if (label === "html") return "_next/static/html.worker.js";
                  if (label === "typescript" || label === "javascript")
                    return "_next/static/ts.worker.js";
                  return "_next/static/editor.worker.js";
                };
              }}
        />
    )
}
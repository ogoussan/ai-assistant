import { useEffect, useRef } from "react";
import { IconFile } from "./ui/icons";
import { Checkbox } from "./ui/checkbox";

interface FileItemProps {
    name: string;
    type: string;
    term?: string;
    selected?: boolean;
    onSelect?: (checked: boolean) => void;
    alwaysShowCheckbox?: boolean;
    disableCheckbox?: boolean;
}

const FileItem = ({ name, type, term, selected, onSelect, alwaysShowCheckbox, disableCheckbox }: FileItemProps) => {
    const fileNameSpanRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fileNameSpanRef.current) {
            const text = fileNameSpanRef.current.textContent;
            const replaced = text?.replace(term || '', `<b>${term || ''}</b>`);
            fileNameSpanRef.current.innerHTML = replaced || "";
        }
    }, [term]);

    return (
        <div className="flex items-center gap-3 rounded-md bg-muted p-2 w-full group cursor-pointer">
            <div className="rounded-md p-2 bg-primary text-primary-foreground">
                <IconFile />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                    <small title={name} className="text-nowrap text-ellipsis overflow-hidden ..." ref={fileNameSpanRef}>{name}</small>
                <div className="text-xs text-muted-foreground">{type}</div>
            </div>
            {!disableCheckbox && (
                <Checkbox checked={selected} className={`${alwaysShowCheckbox ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-300`} onCheckedChange={(checked) => onSelect?.(!!checked)} />
            )}
        </div>
    )
};

export default FileItem;
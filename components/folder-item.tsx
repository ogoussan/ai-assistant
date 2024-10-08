import { useEffect, useRef } from "react";
import { Checkbox } from "./ui/checkbox";
import { FolderIcon } from "lucide-react";

interface FolderItemProps {
    name: string;
    term?: string;
    selected?: boolean;
    onClick?: () => void
    onSelect?: (checked: boolean) => void;
    showCheckbox?: boolean;
}

const FolderItem = ({ name, term = '', selected, onSelect, onClick, showCheckbox }: FolderItemProps) => {
    const fileNameSpanRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fileNameSpanRef.current) {
            const text = fileNameSpanRef.current.textContent;
            const replaced = text?.replace(term, `<b>${term}</b>`);
            fileNameSpanRef.current.innerHTML = replaced || "";
        }
    }, [term]);

    return (
        <div className="flex gap-2 items-center rounded-md bg-muted p-2 w-full group hover:opacity-75 cursor-pointer" onClick={() => {
            showCheckbox ? onSelect?.(!selected) : onClick?.()
        }}>
            <div className="rounded-md p-2 bg-gray-400 text-primary-foreground">
                <FolderIcon />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <small
                    title={name}
                    className={`text-nowrap text-ellipsis overflow-hidden ... ${showCheckbox ? '': 'pr-[40px]'}`}
                    ref={fileNameSpanRef}
                >
                    {name}
                </small>
            </div>
            {showCheckbox && (
                <Checkbox
                    checked={selected}
                    className='group-hover:opacity-100 transition-opacity duration-300'
                />
            )}
        </div>
    );
};

export default FolderItem;

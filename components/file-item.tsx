import { KeyboardEventHandler, ReactNode, useEffect, useRef, useState } from "react";
import { IconFile } from "./ui/icons";
import { Checkbox } from "./ui/checkbox";
import { EditIcon, ExternalLinkIcon, FolderInputIcon, MoreVertical, Trash2Icon } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";

interface FileItemProps {
  name: string;
  type: string;
  term?: string;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
  onRename?: (name: string) => void;
  onMove?: () => void;
  onDelete?: () => void;
  showCheckbox?: boolean;
}

type OptionMenuActionType = 'open' | 'rename' | 'move' | 'delete'

const FileItemOptionMenu = ({ onSelectMenuOption }: { onSelectMenuOption: (actionType: OptionMenuActionType) => void }) => {
  const menuOptions: { type: OptionMenuActionType, label: string, icon: () => ReactNode }[] = [
    {
      type: 'open',
      label: 'Open',
      icon: () => <ExternalLinkIcon size={16} />,
    },
    {
      type: 'rename',
      label: 'Rename',
      icon: () => <EditIcon size={16} />,
    },
    {
      type: 'move',
      label: 'Move',
      icon: () => <FolderInputIcon size={16} />,
    },
    {
      type: 'delete',
      label: 'Delete',
      icon: () => <Trash2Icon size={16} />,
    }
  ]

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="flex flex-col gap-2 w-fit rounded-md bg-muted py-4">
          {menuOptions.map(({ type, label, icon }) => (
            <DropdownMenuItem
              key={type}
              className="flex gap-2 px-4 py-2 items-cente hover:opacity-50"
              onClick={() => onSelectMenuOption(type)}
            >
              {icon()}
              <b className="text-xs">{label}</b>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const FileItem = ({ name, type, term = '', selected, onSelect, onRename, onMove, onDelete, showCheckbox }: FileItemProps) => {
  const fileNameSpanRef = useRef<HTMLDivElement>(null)
  const [renameInputValue, setRenameInputValue] = useState<string>()
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (fileNameSpanRef.current) {
      const text = fileNameSpanRef.current.textContent;
      const replaced = text?.replace(term, `<b>${term || ''}</b>`);
      fileNameSpanRef.current.innerHTML = replaced || "";
    }
  }, [term]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (renameInputValue && renameInputRef.current && !renameInputRef.current.contains(event.target as Node)) {
        console.log('outside')
        onRename?.(renameInputValue)
        setRenameInputValue(undefined)
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [renameInputValue]);

  const handleRenameFileInputSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && renameInputValue) {
      onRename?.(renameInputValue)
      setRenameInputValue(undefined)
    }
  }

  const handleMenuOptionSelect = (actionType: OptionMenuActionType) => {
    switch (actionType) {
      case 'open':
        // TODO: Implement open
        break;
      case 'rename':
        setRenameInputValue(name.split('.').slice(0, -1).join('.'))
        setTimeout(() => {
          renameInputRef.current?.focus()
          renameInputRef.current?.select()
        }, 100)
        break;
      case 'move':
        onMove?.()
        break;
      case 'delete':
        onDelete?.()
        break;
    }
  }

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-muted p-2 w-full group cursor-pointer"
      onClick={() => {
        showCheckbox && onSelect?.(!selected)
      }}>
      <div className="rounded-md p-2 text-primary">
        <IconFile />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        {renameInputValue === undefined ? (
          <small title={name} className="text-nowrap text-ellipsis overflow-hidden ..." ref={fileNameSpanRef}>{name}</small>
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              ref={renameInputRef}
              autoFocus
              value={renameInputValue} 
              onChange={(e) => setRenameInputValue(e.target.value)}
              onKeyDown={handleRenameFileInputSubmit}
            />
            <div>.{name.split('.').pop()}</div>
          </div>
        )} 
      </div>
      {showCheckbox ? (
        <Checkbox
          checked={selected}
          className='group-hover:opacity-100 transition-opacity duration-300'
        />
      ) : (<FileItemOptionMenu onSelectMenuOption={handleMenuOptionSelect} />)}
    </div>
  )
};

export default FileItem;

import { KeyboardEventHandler, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { motion } from "framer-motion"
import { ChevronLeftIcon, FolderIcon } from "lucide-react"
import { NEW_FOLDER_DEFAULT_NAME } from "@/constants/file-constants"
import FileItem from "../file-item"
import FolderItem from "../folder-item"

type CreateFolderProps = {
  selectedItems: Array<{ name: string, path: string, type: string }>,
  currentFolder: { path: string },
  moveItems: (destinationPath: string) => Promise<void>,
  clearSelectedItems: () => void,
  setDisplayStatus: (status: 'standard' | 'create-folder' | 'move') => void
}

export function CreateFolder({ selectedItems, currentFolder, moveItems, clearSelectedItems, setDisplayStatus }: CreateFolderProps) {
  const [newFolderName, setNewFolderName] = useState(NEW_FOLDER_DEFAULT_NAME)
  const inputElement = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNewFolderName(NEW_FOLDER_DEFAULT_NAME)
    inputElement.current?.focus()
    inputElement.current?.select()
  }, [])

  const handleNewFolderNameSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      saveNewFolder()
    }
  }

  const saveNewFolder = () => {
    const destinationPath = `${currentFolder.path}/${newFolderName}`
    moveItems(destinationPath).finally(() => {
      setDisplayStatus('standard')
      clearSelectedItems()
    })
  }

  return (
    <>
      <Button className=" absolute top-2 mr-auto" variant="ghost" onClick={() => {
        setDisplayStatus('standard')
        clearSelectedItems()
      }}>
        <ChevronLeftIcon className="color-gray-400" size={16} />
        <div className="text-m">Back</div>
      </Button>
      <div className="flex flex-col h-screen overflow-hidden gap-4 mt-[3rem] mx-2">
        <div className="relative pr-4">
          <Input
            ref={inputElement}
            placeholder="Folder name"
            className="pl-10"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleNewFolderNameSubmit}
          />
          <FolderIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {!!selectedItems.length && (
          <div className="text-m">Will be moving {selectedItems.length} item(s) to this folder</div>
        )}
        {selectedItems.map(({ name, path, type }) => (
          <div className="opacity-60" key={path}>
            {type === 'file' ? (
              <FileItem
                name={name.split('.').slice(0, -1).join('.')}         
              />
            ) : (
              <FolderItem name={name} />
            )}
          </div>
        ))}
        <motion.div
          className="flex justify-end pr-4"
          initial={{ opacity: 0, display: 'none', translateY: 10 }}
          animate={{ opacity: 1, display: 'flex', translateY: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button className="w-full" onClick={saveNewFolder}>
            Save new folder
          </Button>
        </motion.div>
      </div>
    </>
  )
}
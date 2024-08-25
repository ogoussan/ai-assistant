'use client'
import { KeyboardEventHandler, useEffect, useRef, useState } from "react"
import { ChevronLeftIcon, FolderIcon, FolderInputIcon, FolderPlusIcon, ImportIcon, SaveIcon, SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import FileItem from "./file-item"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import FolderItem from "./folder-item"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb"
import { useFileExplorer } from "@/lib/hooks/use-file-explorer"
import { NEW_FOLDER_NAME } from "@/constants/file-constants"

type DisplayStatus = 'standard' | 'create-folder' | 'move'

export function FileExplorer({ userId }: { userId: string }) {
  const {
    visibleItems,
    selectedItems,
    isItemSelected,
    toggleSelectItem,
    clearSelectedItems,
    navigationFolderStack,
    navigateToFolder,
    navigateToFolderAt,
    moveItems,
    searchQuery,
    setSearchQuery
  } = useFileExplorer(userId)
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>('standard')
  const [newFolderName, setNewFolderName] = useState(NEW_FOLDER_NAME)
  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (displayStatus === 'create-folder')
      inputElement.current?.focus()
      inputElement.current?.select()
  }, [displayStatus]);

  useEffect(() => {
    if (displayStatus) {
      setNewFolderName(NEW_FOLDER_NAME)
    }
  }, [displayStatus])

  const handleNewFolderNameSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      saveNewFolder()
    }
  }

  const saveNewFolder = () => {
    const destinationPath = `${navigationFolderStack[navigationFolderStack.length - 1].path}/${newFolderName}` 
      moveItems(destinationPath).finally(() => {
        setDisplayStatus('standard')
        clearSelectedItems()
      })
  }

  if (displayStatus === 'create-folder') {
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
          {selectedItems.map(({ name, path, type }) => {

            return (
              <div className="opacity-60" key={path}>
                {type === 'file' ? (
                  <FileItem 
                    name={name.split('.').slice(0, -1).join('.')} 
                    type={name.split('.').pop()!} 
                    disableCheckbox 
                  />
                  ) : (
                    <FolderItem 
                      name={name} 
                      disableCheckbox 
                  />
                  )}
              </div>
            )
          })}
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

  return (
    <>
      {selectedItems.length > 0 && (
        <Button className=" absolute top-2 mr-auto" variant="ghost" onClick={() => {
          clearSelectedItems()
          setDisplayStatus('standard')
        }}>
          <div className="text-m">Cancel</div>
        </Button>
      )}
      <div className="flex flex-col h-screen overflow-hidden gap-4 mt-[3rem] mx-2">
        <div className="relative pr-4">
          <Input
            placeholder="Search"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {!searchQuery.trim() && (
          <Breadcrumb>
          <BreadcrumbList>
            {navigationFolderStack.map((folder, index) => (
              <>
                <BreadcrumbItem className="cursor-pointer" key={folder?.path} onClick={() => {
                  if (index + 1 !== navigationFolderStack.length) {
                    if (displayStatus !== 'move') {
                      clearSelectedItems()
                    }
                    
                    navigateToFolderAt(index)
                  }
                }}>{index === navigationFolderStack.length - 1 ? (
                  <BreadcrumbPage>
                    <small>
                      <b>{folder?.name}</b>
                    </small>
                  </BreadcrumbPage>
                ) : (<small>{folder?.name}</small>)}</BreadcrumbItem>
                {index < navigationFolderStack.length - 1 && <BreadcrumbSeparator />}
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        )}
        {(
          <div className="flex flex-col gap-2 overflow-y-scroll pr-4">
            {visibleItems.map((item) => (
              item.type === 'folder' ? (
                <motion.div
                  key={item.path}
                  className="flex justify-end mt-auto"
                  initial={{ opacity: 0, display: 'none', translateY: 10 }}
                  animate={{ opacity: 1, display: 'flex', translateY: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <FolderItem
                    name={item.name}
                    term={searchQuery}
                    selected={isItemSelected(item.path)}
                    onClick={() => {
                      navigateToFolder(item)
                      setSearchQuery('')
                    }}
                    onSelect={() => toggleSelectItem(item)}
                    alwaysShowCheckbox={!!selectedItems.length}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={item.path}
                  className="flex justify-end mt-auto"
                  initial={{ opacity: 0, display: 'none', translateY: 10 }}
                  animate={{ opacity: 1, display: 'flex', translateY: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <FileItem
                    name={item.name}
                    type={item.type}
                    term={searchQuery}
                    selected={isItemSelected(item.path)}
                    onSelect={() => toggleSelectItem(item)}
                    alwaysShowCheckbox={!!selectedItems.length}
                  />
                </motion.div>
              )
            ))}
          </div>
        )}
        <motion.div
          className="flex gap-4 items-center pr-4"
          initial={{ opacity: 0, display: 'none', translateY: 10 }}
          animate={selectedItems.length && displayStatus === 'move' ? 'visible' : 'hidden'}
          variants={{
            visible: { opacity: 1, display: 'flex', translateY: 0 },
            hidden: { opacity: 0, display: 'none', translateY: 10 },
          }}
        >
          <div className="text-nowrap text-xs font-bold">{selectedItems.length} item(s)</div>
          <Button className="w-full" onClick={() => {
            const destinationPath = `${navigationFolderStack[navigationFolderStack.length - 1].path}`
            moveItems(destinationPath).finally(() => {
              setDisplayStatus('standard')
              clearSelectedItems()
            })
          }}>
            <ImportIcon className="mr-2" />
            Move here
          </Button>
        </motion.div>
        <motion.div
          className="flex pr-4"
          initial={{ opacity: 0, display: 'none', translateY: 10 }}
          animate={selectedItems.length ? 'visible' : 'hidden'}
          variants={{
            visible: { opacity: 1, display: 'flex', translateY: 0 },
            hidden: { opacity: 0, display: 'none', translateY: 10 },
          }}
        >
          <Button className="w-full flex" variant='outline' onClick={() => {
            setDisplayStatus('create-folder');
          }}>
            <FolderPlusIcon className="mr-2" />
            Create a folder
          </Button>
        </motion.div>
        <motion.div
          className="flex pr-4"
          initial={{ opacity: 0, display: 'none', translateY: 10 }}
          animate={selectedItems.length && displayStatus !== 'move' ? 'visible' : 'hidden'}
          variants={{
            visible: { opacity: 1, display: 'flex', translateY: 0 },
            hidden: { opacity: 0, display: 'none', translateY: 10 },
          }}
        >
          <Button className="w-full" variant='outline' onClick={() => setDisplayStatus('move')}>
            <FolderInputIcon className="mr-2" />
            Move to a folder
          </Button>
        </motion.div>
        <motion.div
          className="flex gap-4 items-center"
          initial={{ opacity: 0, display: 'none', translateY: 10 }}
          animate={selectedItems.length ? 'visible' : 'hidden'}
          variants={{
            visible: { opacity: 1, display: 'flex', translateY: 0 },
            hidden: { opacity: 0, display: 'none', translateY: 10 },
          }}
        >
          <Button className="w-full" variant='ghost' onClick={() => {
            clearSelectedItems()
            setDisplayStatus('standard')
          }}>
            Cancel
          </Button>
        </motion.div>
      </div>
    </>
  )
}
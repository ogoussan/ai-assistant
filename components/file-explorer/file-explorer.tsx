'use client'
import { useMemo, useState } from "react"
import {
  CircleX,
  FolderInputIcon,
  FolderPlusIcon,
  ImportIcon,
  SearchIcon,
  SquareCheck,
  Trash2Icon
} from "lucide-react"
import { Input } from "../ui/input"
import FileItem from "../file-item"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import FolderItem from "../folder-item"
import { useFileExplorer } from "@/lib/hooks/use-file-explorer"
import { Checkbox } from "../ui/checkbox"
import { CreateFolder } from "./create-folder-view"
import BreadcrumbNavigation from "./breadcrumb-navigation"
import { FileExplorerButton, FileExplorerButtonProps } from "./file-explorer-button"

type DisplayStatus = 'standard' | 'create-folder' | 'move'

export function FileExplorer({ userId }: { userId: string }) {
  const {
    navigationFolderStack,
    currentFolder,
    selectedItems,
    areAllSelected,
    isItemSelected,
    toggleSelectItem,
    selectedAllItems,
    clearSelectedItems,
    navigateToFolder,
    navigateToFolderAtIndex,
    moveItems,
    renameItem,
    searchQuery,
    setSearchQuery,
    visibleFiles,
    visibleFolders,
    deleteItems,
  } = useFileExplorer(userId)
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>('standard')
  const [isSelecting, setIsSelecting] = useState(false)
  const [isSelectionDisabled, setIsSelectionDisabled] = useState()

  const getButtonAnimationProps = (isVisible: boolean) => ({
    initial: {
      opacity: 0,
      display: 'none',
      translateY: 10
    },
    variants: {
      visible: {
        opacity: 1,
        display: 'flex',
        translateY: 0
      },
      hidden: {
        opacity: 0,
        display: 'none',
        translateY: 10
      },
    },
    animate: isVisible ? 'visible' : 'hidden'
  })

  const itemAnimation = {
    initial: { opacity: 0, display: 'none', translateY: 10 },
    animate: { opacity: 1, display: 'flex', translateY: 0 },
    transition: { duration: 0.4 }
  }

  const moveHereButtonProps: FileExplorerButtonProps = useMemo(() => ({
    onClick: () => {
      moveItems(currentFolder.path).finally(() => {
        setDisplayStatus('standard')
        clearSelectedItems()
      })
    },
    leftContent: () => (
      <div className="text-nowrap text-xs font-bold">
        {selectedItems.length} item(s)
      </div>
    ),
    icon: () => <ImportIcon className="mr-2" />,
    label: 'Move here',
    ...getButtonAnimationProps(selectedItems.length > 0 && displayStatus === 'move')
  }), [currentFolder, selectedItems, displayStatus])

  const moveHereCancelButtonProps: FileExplorerButtonProps = useMemo(() => ({
    onClick: () => {
      clearSelectedItems()
      setDisplayStatus('standard')
    },
    label: 'Cancel',
    ...getButtonAnimationProps(selectedItems.length > 0 && displayStatus === 'move')
  }), [currentFolder, selectedItems, displayStatus])

  const createFolderWithItemsButtonProps: FileExplorerButtonProps = useMemo(() => ({
    onClick: () => {
      setDisplayStatus('create-folder')
    },
    icon: () => <FolderPlusIcon className="mr-2" />,
    label: 'Add to new folder',
    ...getButtonAnimationProps(!!selectedItems.length && displayStatus === 'standard')
  }), [currentFolder, selectedItems, displayStatus])

  const moveSelectedItemProps: FileExplorerButtonProps = useMemo(() => ({
    onClick: () => {
      setDisplayStatus('move')
      setIsSelecting(false)
    },
    icon: () => <FolderInputIcon className="mr-2" />,
    label: 'Move to a folder',
    ...getButtonAnimationProps(!!selectedItems.length && displayStatus !== 'move')
  }), [currentFolder, selectedItems, displayStatus])

  const deleteSelectedItemsProp: FileExplorerButtonProps = useMemo(() => ({
    onClick: () => {
      deleteItems()
    },
    icon: () => <Trash2Icon className="mr-2" />,
    label: 'Delete',
    ...getButtonAnimationProps(!!selectedItems.length && displayStatus !== 'move')
  }), [currentFolder, selectedItems, displayStatus])

  if (displayStatus === 'create-folder') {
    return (
      <CreateFolder
        selectedItems={selectedItems}
        currentFolder={currentFolder}
        moveItems={(path) => moveItems(path).then(
          () => {setIsSelecting(false)
        })}
        clearSelectedItems={clearSelectedItems}
        setDisplayStatus={setDisplayStatus}
      />
    )
  }

  return (
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
        <BreadcrumbNavigation
          navigationFolderStack={navigationFolderStack}
          displayStatus={displayStatus}
          clearSelectedItems={clearSelectedItems}
          navigateToFolderAtIndex={navigateToFolderAtIndex}
        />
      )}
      {(
        <div className="flex flex-col gap-2 overflow-y-scroll pr-4">
          {!isSelectionDisabled && (!isSelecting ? (
            <Button className="ml-auto flex gap-2 hover:bg-background border-2 border-secondary" variant="secondary" onClick={() => {
              setIsSelecting(true)
            }}>
              <small className="text-xs">select items</small>
              <SquareCheck size={16} opacity={0.5} />
            </Button>
          ) : (
            <motion.div
              className="flex items-center gap-2"
              initial={{ translateX: 10 }}
              animate={{ translateX: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button className="ml-auto flex gap-2" variant="outline" onClick={() => {
                setIsSelecting(false)
                clearSelectedItems()
              }}>
                <small className="text-xs">cancel select</small>
                <CircleX size={16} opacity={0.5} />
              </Button>
              <div className="p-1 border-solid border-2 rounded-md">
                <Checkbox
                  checked={areAllSelected}
                  onCheckedChange={(checked) => checked
                    ? selectedAllItems()
                    : clearSelectedItems()
                  }
                />
              </div>
            </motion.div>
          ))}
          {visibleFolders.map((item) => (
              <motion.div
                key={item.path}
                className="flex justify-end mt-auto"
                {...itemAnimation}
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
                  showCheckbox={isSelecting}
                />
              </motion.div>
            ))}
            {visibleFiles.map((item) => (
                <motion.div
                  key={item.path}
                  className="flex justify-end mt-auto"
                  {...itemAnimation}
                >
                  <FileItem
                    name={item.name}
                    type={item.type}
                    term={searchQuery}
                    selected={isItemSelected(item.path)}
                    onSelect={() => toggleSelectItem(item)}
                    onRename={(name) => renameItem(item, name)}
                    onMove={() => {
                      toggleSelectItem(item)
                      setDisplayStatus('move')
                      setIsSelecting(false)
                    }}
                    onDelete={() => {
                      deleteItems([item])
                    }}
                    showCheckbox={isSelecting}
                  />
                </motion.div>
              ))}
        </div>
      )}
      <FileExplorerButton {...moveHereButtonProps} />
      <FileExplorerButton {...moveHereCancelButtonProps} />
      <FileExplorerButton {...createFolderWithItemsButtonProps} />
      <FileExplorerButton {...moveSelectedItemProps} />
      <FileExplorerButton {...deleteSelectedItemsProp} />
    </div>
  )
}
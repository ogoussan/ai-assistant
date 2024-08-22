'use client'
import { useMemo, useState } from "react"
import { ChevronLeftIcon, FolderIcon, FolderInputIcon, FolderPlusIcon, ImportIcon, SaveIcon, SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import FileItem from "./file-item"
import Fuse from 'fuse.js'
import { Folder } from "@/lib/types"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import { moveFiles } from '@/app/files/actions'
import { getFolderFromPath } from "@/lib/utils"
import FolderItem from "./folder-item"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb"

export function FileExplorer({ rootFolder, userId }: { rootFolder: Folder, userId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFolders, setSelectedFolders] = useState<string[]>([])
  const [selectedMoveFiles, setSelectedMoveFiles] = useState<string[]>([])
  const [createFolder, setCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [path, setPath] = useState<string[]>([])
  const files = useMemo(() => getFolderFromPath(rootFolder, path)?.files || [], [path])
  const folders = useMemo(() => getFolderFromPath(rootFolder, path)?.subfolders || [], [path])
  const fuseFiles = useMemo(() => new Fuse(files, { keys: ['name'], isCaseSensitive: false, threshold: 0.3 }), [files])
  const fuseFolders = useMemo(() => new Fuse(folders, { keys: ['name'], isCaseSensitive: false, threshold: 0.3 }), [folders])

  const filteredAndSortedFiles = useMemo(() => {
    if (!searchQuery) return files.sort((a, b) => a.name.localeCompare(b.name))
    const results = fuseFiles.search(searchQuery)
    return results.map(result => result.item)
  }, [files, searchQuery, fuseFiles])

  const filteredAndSortedFolders= useMemo(() => {
    if (!searchQuery) return folders.sort((a, b) => a.name.localeCompare(b.name))
    const results = fuseFolders.search(searchQuery)
    return results.map(result => result.item)
  }, [folders, searchQuery, fuseFiles])

  const handleFileSelect = (name: string, checked: boolean) => {
    setSelectedFiles(prev => checked ? [...prev, name] : prev.filter(file => file !== name))
  }

  const handleFolderSelect = (name: string, checked: boolean) => {
    setSelectedFolders(prev => checked ? [...prev, name] : prev.filter(folder => folder !== name))
  }

  const handleMoveFiles = async () => {
    const newPath = path.join('/') +( newFolderName ? "/" + newFolderName : '')
    await moveFiles(selectedMoveFiles, `${userId}/${newPath}`)
  }

  if (createFolder) {
    return (
      <>
        <Button className=" absolute top-2 mr-auto" variant="ghost" onClick={() => setCreateFolder(false)}>
          <ChevronLeftIcon className="color-gray-400" size={16} />
          <div className="text-m">Back</div>
        </Button>
        <div className="flex flex-col h-screen overflow-hidden gap-4 mt-[3rem] mx-2">
          <div className="relative">
            <Input
              placeholder="Folder name"
              className="pl-10"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <FolderIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, display: 'none', translateY: 10 }}
            animate={{ opacity: 1, display: 'flex', translateY: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button className="w-full mb-2" onClick={() => handleMoveFiles()}>
              Move to new folder
            </Button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      {selectedMoveFiles.length > 0 && (
        <Button className=" absolute top-2 mr-auto" variant="ghost" onClick={() => setSelectedMoveFiles([])}>
        <ChevronLeftIcon className="color-gray-400" size={16} />
        <div className="text-m">Back</div>
      </Button>
      )}
      <div className="flex flex-col h-screen overflow-hidden gap-4 mt-[3rem] mx-2">
      <div className="relative">
        <Input
          placeholder="Search"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="cursor-pointer" onClick={() => setPath([])}>
            <small>My Files</small>
          </BreadcrumbItem>
          {(path).map((route, i) => (
            <>
              {i < path.length + 1 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="cursor-pointer" key={i} onClick={() => setPath((prev) => {
                const newPath = prev.slice(0, i+1);
               
                if (newPath.length !== path.length) {
                  setSelectedFiles([])
                }

                return newPath
              })}><small>{route}</small></BreadcrumbItem>
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {(
        <div className="flex flex-col gap-2 overflow-y-scroll pr-4">
        {filteredAndSortedFolders.map((folder) => (
          <motion.div
            key={folder.path}
            className="flex justify-end mt-auto"
            initial={{ opacity: 0, display: 'none', translateY: 10 }}
            animate={{ opacity: 1, display: 'flex', translateY: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FolderItem
              name={folder.name}
              term={searchQuery}
              selected={selectedFolders.includes(folder.path)}
              onClick={() => setPath((prev) => [...prev, folder.name])}
              onSelect={(isChecked) => handleFolderSelect(folder.path, isChecked)}
              alwaysShowCheckbox={!!selectedFiles.length}
            />
          </motion.div>
        ))}
      </div>
      )}
      <div className="flex flex-col gap-2 overflow-y-scroll pr-4">
        {filteredAndSortedFiles.map((file) => (
          <motion.div
            key={file.key}
            className="flex justify-end mt-auto"
            initial={{ opacity: 0, display: 'none', translateY: 10 }}
            animate={{ opacity: 1, display: 'flex', translateY: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FileItem
              name={file.name}
              type={file.type}
              term={searchQuery}
              selected={selectedFiles.includes(file.key)}
              onSelect={(isChecked) => handleFileSelect(file.key, isChecked)}
              alwaysShowCheckbox={!!selectedFiles.length}
            />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex gap-4 items-center"
        initial={{ opacity: 0, display: 'none', translateY: 10 }}
        animate={selectedMoveFiles.length ? 'visible' : 'hidden'}
        variants={{
          visible: { opacity: 1, display: 'flex', translateY: 0 },
          hidden: { opacity: 0, display: 'none', translateY: 10 },
        }}
      >
        <div className="text-nowrap text-xs font-bold">{selectedMoveFiles.length} items</div>
        <Button className="w-full" onClick={handleMoveFiles}>
          <ImportIcon className="mr-2" />
          Move here
        </Button>
      </motion.div>
      <motion.div
        className="flex"
        initial={{ opacity: 0, display: 'none', translateY: 10 }}
        animate={selectedFiles.length && !selectedMoveFiles.length ? 'visible' : 'hidden'}
        variants={{
          visible: { opacity: 1, display: 'flex', translateY: 0 },
          hidden: { opacity: 0, display: 'none', translateY: 10 },
        }}
      >
        <Button className="w-full mb-2" onClick={() => setSelectedMoveFiles(selectedFiles)}>
          <FolderInputIcon className="mr-2" />
          Move to a folder
        </Button>
      </motion.div>
    </div>
    </>
  )
}
'use client'
import { useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, FolderIcon, FolderInputIcon, FolderPlusIcon, SaveIcon, SearchIcon } from "lucide-react"
import { Input } from "./ui/input"
import FileItem from "./file-item"
import Fuse from 'fuse.js'
import { FileData } from "@/lib/types"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import { moveFiles } from '@/app/files/actions'

export function FileExplorer({ files, userId }: { files: FileData[], userId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedMoveFiles, setSelectedMoveFiles] = useState<string[]>([])
  const [createFolder, setCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const fuse = useMemo(() => new Fuse(files, { keys: ['name'], isCaseSensitive: false, threshold: 0.3 }), [files])

  const filteredAndSortedFiles = useMemo(() => {
    if (!searchQuery) return files.sort((a, b) => a.name.localeCompare(b.name))
    const results = fuse.search(searchQuery)
    return results.map(result => result.item)
  }, [files, searchQuery, fuse])

  const handleSelect = (name: string, checked: boolean) => {
    setSelectedFiles(prev => checked ? [...prev, name] : prev.filter(file => file !== name))
  }

  const handleMoveFiles = async () => {
    
    await moveFiles(selectedMoveFiles, `${userId}/${newFolderName}`)
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

  if (selectedMoveFiles.length) {
    return (
      <>
        <Button className=" absolute top-2 mr-auto" variant="ghost" onClick={() => setSelectedMoveFiles([])}>
          <ChevronLeftIcon className="color-gray-400" size={16} />
          <div className="text-m">Back</div>
        </Button>
        <div className="flex flex-col h-screen overflow-hidden gap-4 mt-[3rem] mx-2">
          <div className="relative">
            <Input
              placeholder="Search for folder"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <motion.div
            className="flex justify-end mt-auto"
            initial={{ opacity: 0, display: 'none', translateY: 10 }}
            animate={{ opacity: 1, display: 'flex', translateY: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button className="w-full mb-2" onClick={() => setCreateFolder(true)}>
              <FolderPlusIcon className="mr-2" />
              Add new folder
            </Button>
          </motion.div>
        </div>
      </>
    )
  }

  return (
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
      <div className="flex flex-col gap-2 overflow-y-scroll pr-4 pb-8">
        {filteredAndSortedFiles.map((file) => (
          <motion.div
            key={file.key}
            className="flex justify-end mt-auto"
            initial={{ opacity: 0, display: 'none', translateY: 10 }}
            animate={{ opacity: 1, display: 'flex', translateY: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FileItem
              name={file.name.split('.').slice(0, -1).join('.')}
              type={file.type}
              term={searchQuery}
              selected={selectedFiles.includes(file.key)}
              onSelect={(isChecked) => handleSelect(file.key, isChecked)}
              alwaysShowCheckbox={!!selectedFiles.length}
            />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex justify-end mt-auto"
        initial={{ opacity: 0, display: 'none', translateY: 10 }}
        animate={selectedFiles.length ? 'visible' : 'hidden'}
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
  )
}
import { useCallback, useEffect, useMemo, useState } from "react"
import { FileExplorerFolder, FileExplorerItem } from "../types"
import { aggregateFileExplorerItems } from "../file.utils"
import Fuse from "fuse.js"
import { moveObject } from "../knowledge-base/s3"

export const useFileExplorer = (userId: string) => {
    const [navigationFolderStack, setNavigationFolderStack] = useState<FileExplorerFolder[]>([])
    const [items, setItems] = useState<FileExplorerItem[]>([])
    const immediateItems = useMemo(() => [
        ...(navigationFolderStack[navigationFolderStack.length - 1]?.folders || []),
        ...(navigationFolderStack[navigationFolderStack.length - 1]?.files || [])
    ], [navigationFolderStack])
    const [selectedItems, setSelectedItems] = useState<FileExplorerItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const fuseItems = useMemo(() => new Fuse(items, { keys: ['name'], isCaseSensitive: false, threshold: 0.3 }), [items])
    const searchResultItems = useMemo(() => {
        if (!searchQuery.trim()) return items.sort()
        const results = fuseItems.search(searchQuery)
        return results.map(result => result.item).sort()
    }, [items, searchQuery, fuseItems])
    const visibleItems = useMemo(() => searchQuery.trim() ? searchResultItems : immediateItems, [searchQuery, searchResultItems, immediateItems, items])
    const isShowSearchResults = useMemo(() => searchQuery.trim(), [searchQuery])

    useEffect(() => {
        fetchItems()
    }, [])

    useEffect(() => {
        if (items.length && !navigationFolderStack.length) {
            const rootFolder = items.find((_item) => _item.path.split('/').filter(Boolean).join('/') === userId) as FileExplorerFolder

            if (rootFolder) {
                setNavigationFolderStack([rootFolder])
            }
        }
    }, [items])

    const fetchItems = async (): Promise<FileExplorerItem[]> => {
        const _items = await aggregateFileExplorerItems(userId)
        setItems(_items)
        return _items
    }

    const navigateToFolder = (folder: FileExplorerFolder, newItems?: FileExplorerItem[]) => {
        if (!folder) {
            return;
        }

        setNavigationFolderStack(
            folder.path.split('/').filter(Boolean).map((_, i) => {
                const path = folder.path.split('/').filter(Boolean).slice(0, i + 1).join('/')
                return (newItems ? newItems : items).find((_folder) => _folder.path === path)
            }).sort((a, b) => a!.path.split('/').length - b!.path.split('/').length) as FileExplorerFolder[]
        )
    }

    const navigateToFolderAt = (index: number) => {
        setNavigationFolderStack((prev) => prev.slice(0, index + 1))
    }

    const toggleSelectItem = (item: FileExplorerItem) => {
        setSelectedItems((prev) => prev.map((_item) => _item.path).includes(item.path) ? prev.filter((_item) => _item.path !== item.path) : [...prev, item])
    }

    const isItemSelected = useCallback((itemPath: string) => selectedItems.some((selectedItem) => selectedItem.path === itemPath), [selectedItems])

    const clearSelectedItems = useCallback(() => {
        setSelectedItems([])
    }, [])

    const mergePaths = (path1: string, path2: string) => {
        const maxLength = Math.max(path1.split('/').length, path2.split('/').length)
        const mergePathSegments: string[] = []

        for(let i = 0; i < maxLength; i++) {
            mergePathSegments.push(path1.split('/')[i] || path2.split('/')[i])
        }

        return mergePathSegments.join('/')
    }

    const moveItems = useCallback(async (path: string) => {
        let sourcePaths: string[] = []
        let destinationPaths: string[] = []

        selectedItems.forEach((item) =>  {
            if (item.type === 'folder') {
                const folderStack: FileExplorerFolder[] = [item]
                const folderPathOffset = item.path.split('/').filter(Boolean).length 

                while (folderStack.length) {
                    const currentFolder = folderStack.pop()!
                    const currentFolderSourcePaths = currentFolder.files.map((file) => file.path)
                    const currentFolderDestinationPaths = currentFolder.files.map((file) =>  {
                        const pathSuffix = file.path.split('/').slice(folderPathOffset - 1, -1).join('/')

                        return path + '/' + pathSuffix
                    })
                    console.log('destination paths', currentFolderDestinationPaths)
                    sourcePaths = [...sourcePaths, ...currentFolderSourcePaths]
                    destinationPaths = [...destinationPaths, ...currentFolderDestinationPaths]
                    currentFolder.folders.forEach((folder) => folderStack.push(folder))
                }
            } else {
                sourcePaths.push(item.path)
            }
        })
        
        await Promise.all(sourcePaths.map((sourcePath, i) => {
            console.log('destination path:', destinationPaths[i])
            return moveObject(sourcePath, destinationPaths[i] || path)
        }))
        fetchItems().then((_items) => {
            const newFolder = _items.find((item) => item.path === path) as FileExplorerFolder
            navigateToFolder(newFolder, _items)
        })
    }, [selectedItems])

    return ({
        visibleItems,
        isShowSearchResults,
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
    })
}
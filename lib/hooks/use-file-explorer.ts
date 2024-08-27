import { useCallback, useEffect, useMemo, useState } from "react"
import { FileExplorerFolder, FileExplorerItem } from "../types"
import { aggregateFileExplorerItems } from "../file-explorer"
import Fuse from "fuse.js"
import { moveObject } from "../knowledge-base/s3"
import { slicePath, splitFileName } from "../path.helper"

export const useFileExplorer = (userId: string) => {
    // NAVIGATION STATE
    const [navigationFolderStack, setNavigationFolderStack] =
        useState<FileExplorerFolder[]>([])
    const currentFolder = useMemo(
        () => navigationFolderStack[navigationFolderStack.length - 1],
        [navigationFolderStack]
    )

    // ITEM STATE
    const [totalItems, setTotalItems] = useState<FileExplorerItem[]>([])
    const folderItems = useMemo(() => [
        ...(currentFolder?.folders || []),
        ...(currentFolder?.files || [])
    ], [currentFolder])

    // SEARCH STATE
    const fuseItems = useMemo(() => new Fuse(totalItems, {
        keys: ['name'],
        isCaseSensitive: false,
        threshold: 0.3
    }), [totalItems])
    const [searchQuery, setSearchQuery] = useState('')
    const searchResultItems = useMemo(() => {
        if (!searchQuery.trim()) return totalItems.sort()
        const results = fuseItems.search(searchQuery)
        return results.map(result => result.item).sort()
    }, [totalItems, searchQuery, fuseItems])

    // ITEM STATE (dependant on SEARCH STATE)
    const visibleItems = useMemo(() => searchQuery.trim()
        ? searchResultItems
        : folderItems,
    [searchQuery, searchResultItems, folderItems])

    // SELECTION STATE
    const [selectedItems, setSelectedItems] = useState<FileExplorerItem[]>([])
    const areAllSelected = useMemo(
        () => !!selectedItems.length
            && visibleItems
                .every((item) => selectedItems
                    .map((_item) => _item.path)
                    .includes(item.path)
                ),
        [selectedItems, visibleItems])

    useEffect(() => {
        fetchItems()
    }, [])

    useEffect(() => {
        if (totalItems.length && !navigationFolderStack.length) {
            const rootFolder = 
                totalItems.find((_item) => _item.path === userId) as FileExplorerFolder

            if (rootFolder) {
                setNavigationFolderStack([rootFolder])
            }
        }
    }, [totalItems])

    const fetchItems = async (): Promise<FileExplorerItem[]> => {
        const _items = await aggregateFileExplorerItems(userId)
        setTotalItems(_items)

        return _items
    }

    const navigateToFolder = (
        folder: FileExplorerFolder,
        newItems?: FileExplorerItem[]
    ) => {

        if (!folder) {
            return;
        }

        setNavigationFolderStack(
            folder.path.split('/').filter(Boolean).map((_, i) => {
                const path = slicePath(folder.path, 0, i + 1)
                
                return (newItems ? newItems : totalItems)
                    .find((_folder) => _folder.path === path)
            }).sort((a, b) => a!.path.split('/')
            .length - b!.path.split('/').length) as FileExplorerFolder[]
        )
    }

    const navigateToFolderAtIndex = (index: number) => {
        setNavigationFolderStack((prev) => prev.slice(0, index + 1))
    }

    const toggleSelectItem = (item: FileExplorerItem) => {
        setSelectedItems((prev) => {
            const isPathIncluded = prev
                .map((_item) => _item.path).includes(item.path);
                    return isPathIncluded  
                        ? prev.filter((_item) => _item.path !== item.path) 
                        : [...prev, item]
        }   
    )}

    const isItemSelected = useCallback((itemPath: string) => selectedItems
        .some((selectedItem) => selectedItem.path === itemPath), 
        [selectedItems]
    )

    const selectedAllItems = useCallback(() => {
        console.log('select all', visibleItems)
        setSelectedItems(visibleItems)
    }, [visibleItems])


    const clearSelectedItems = useCallback(() => {
        setSelectedItems([])
    }, [])

    const renameItem = useCallback(async (item: FileExplorerItem, name: string) => {
        const [nameWithoutExtension, extension] = splitFileName(item.name)

        console.log([nameWithoutExtension, extension])

        if (nameWithoutExtension === name) {
            return
        }

        if (item.type === 'file') {
            const destinationPath = item.path
                .split('/').filter(Boolean)
                .slice(0, -1).join('/')
            const fileName = `${name}.${extension}`
            await moveObject(item.path, destinationPath, fileName)
            const updatedItems = await fetchItems()
            const updatedCurrentFolder = updatedItems
                .find((item) => item.path === currentFolder.path) as FileExplorerFolder
            setNavigationFolderStack((prev) => [...prev.slice(0, -1), updatedCurrentFolder])
        }
    }, [navigationFolderStack])

    const moveItems = useCallback(async (path = currentFolder.path) => {
        let sourcePaths: string[] = []
        let destinationPaths: string[] = []

        selectedItems.forEach((item) => {
            if (item.type === 'folder') {
                const folderStack: FileExplorerFolder[] = [item]
                const folderPathOffset = item.path.split('/')
                    .filter(Boolean).length

                while (folderStack.length) {
                    const currentFolder = folderStack.pop()!
                    const currentFolderSourcePaths = currentFolder.files
                        .map((file) => file.path)
                    const currentFolderDestinationPaths = currentFolder.files
                        .map((file) => {
                        const pathSuffix = file.path
                            .split('/')
                            .slice(folderPathOffset - 1, -1)
                            .join('/')

                        return path + '/' + pathSuffix
                    })
                    sourcePaths = [...sourcePaths, ...currentFolderSourcePaths]
                    destinationPaths = [
                        ...destinationPaths,
                        ...currentFolderDestinationPaths
                    ]
                    currentFolder.folders.forEach((folder) => folderStack.push(folder))
                }
            } else {
                sourcePaths.push(item.path)
            }
        })

        await Promise.all(sourcePaths.map((sourcePath, i) => {
            return moveObject(sourcePath, destinationPaths[i] || path)
        }))

        fetchItems().then((_items) => {
            const newFolder = _items
            .find((item) => item.path === path) as FileExplorerFolder
            navigateToFolder(newFolder, _items)
        })
    }, [selectedItems])

    return ({
        navigationFolderStack,
        currentFolder,
        selectedItems,
        isItemSelected,
        areAllSelected,
        toggleSelectItem,
        selectedAllItems,
        clearSelectedItems,
        navigateToFolder,
        navigateToFolderAtIndex,
        moveItems,
        renameItem,
        searchQuery,
        setSearchQuery
    })
}
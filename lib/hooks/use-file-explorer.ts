import { useCallback, useEffect, useMemo, useState } from "react"
import { FileExplorerFolder, FileExplorerItem } from "../types"
import { aggregateFileExplorerItems } from "../file.utils"
import Fuse from "fuse.js"

export const useFileExplorer = (userId: string) => {
    const [navigationFolderStack, setNavigationFolderStack] = useState<FileExplorerFolder[]>([])
    const [items, setItems] = useState<FileExplorerItem[]>([])
    const immediateItems = useMemo(() => [
        ...(navigationFolderStack[navigationFolderStack.length - 1]?.folders || []),
        ...(navigationFolderStack[navigationFolderStack.length - 1]?.files || [])
    ], [navigationFolderStack])
    const [selectedItems, setSelectedItems] = useState<FileExplorerItem[]>([])
    const [revisionCounter, setRevisionCounter] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const fuseItems = useMemo(() => new Fuse(items, { keys: ['name'], isCaseSensitive: false, threshold: 0.3 }), [items])
    const searchResultItems = useMemo(() => {
        if (!searchQuery.trim()) return items.sort()
        const results = fuseItems.search(searchQuery)
        return results.map(result => result.item).sort()
    }, [items, searchQuery, fuseItems])
    const visibleItems = useMemo(() => searchQuery.trim() ? searchResultItems : immediateItems, [searchQuery, searchResultItems, immediateItems])
    const isShowSearchResults = useMemo(() => searchQuery.trim(), [searchQuery])

    useEffect(() => {
        if (items.length && !navigationFolderStack.length) {
            const rootFolder = items.find((_item) => _item.path.split('/').filter(Boolean).join('/') === userId) as FileExplorerFolder

            if (rootFolder) {
                setNavigationFolderStack([rootFolder])
            }
        }
    }, [items])

    useEffect(() => {
        aggregateFileExplorerItems(userId).then((_items) => {
            setItems(_items)
        })
    }, [revisionCounter])

    const navigateToFolder = (folder: FileExplorerFolder) => {
        setNavigationFolderStack(
            folder.path.split('/').filter(Boolean).map((_, i) => {
                const path = folder.path.split('/').filter(Boolean).slice(0, i + 1).join('/')
                return items.find((_folder) => _folder.path === path)
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

    const moveItems = useCallback(() => {
        // TODO: Implement move items
        setRevisionCounter((prevRevisionNumber) => prevRevisionNumber + 1)
    }, [])

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
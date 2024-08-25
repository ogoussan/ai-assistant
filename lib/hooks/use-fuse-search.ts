import Fuse from "fuse.js"
import { useMemo, useState } from "react"

export function useFuseSearch<T>(items: T[], getFn: (item: T) => string, sortFn: (a: T, b: T) => number) {
    const [searchQuery, setSearchQuery] = useState('')
    const fuseItems = useMemo(() => new Fuse(items, { keys: ['name'], isCaseSensitive: false, threshold: 0.3, getFn }), [items])

    const searchResultItems = useMemo(() => {
        if (!searchQuery.trim()) return items.sort(sortFn)
        const results = fuseItems.search(searchQuery)
        return results.map(result => result.item).sort(sortFn)
      }, [items, searchQuery, fuseItems])

    return { searchResultItems, searchQuery, setSearchQuery }
}   
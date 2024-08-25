import { HOME_DIRECTORY_NAME } from "@/constants/file-constants"
import { fetchObjectPaths } from "./knowledge-base/s3"
import { FileExplorerFile, FileExplorerFolder, FileExplorerItem } from "./types"

export const aggregateFileExplorerItems = async (userId: string): Promise<FileExplorerItem[]> => {
    const objectPaths = await fetchObjectPaths(userId)
    const files: FileExplorerFile[] = objectPaths.map((objectPath) => {
        return ({
            type: 'file',
            path: objectPath,
            name: objectPath.split('/').filter(Boolean).pop()!
        })
    })

    let folders: FileExplorerFolder[] = []

    files.forEach((file) => {
        const directoryNames = file.path.split('/').filter(Boolean).slice(0, -1); 
        directoryNames.forEach((directoryName, directoryIndex) => {
            const containsDirectoryNameInFolders = folders.some(
                (folder) => folder.path.split('/').filter(Boolean)[directoryIndex] === directoryName
            )

            const path = file.path.split('/').filter(Boolean).slice(0, directoryIndex).join('/')
            const isFileOfCurrentDirectory = file.path.split('/').filter(Boolean).length === directoryIndex + 2

            if (!containsDirectoryNameInFolders) {
                const newFolder: FileExplorerItem = { 
                    type: 'folder',
                    path: `${path}/${directoryName}`.split('/').filter(Boolean).join('/'),
                    name: directoryIndex === 0 ? HOME_DIRECTORY_NAME : directoryName,
                    files: isFileOfCurrentDirectory 
                        ? [file] 
                        : [],
                    folders: []
                }

                const previousDirectoryName = path.split('/').filter(Boolean).pop()
                const previousFolder = folders.find((folder) => {
                    return folder.path.split('/').filter(Boolean)[directoryIndex - 1] === previousDirectoryName
                })

                if (previousFolder) {
                    previousFolder.folders = [...previousFolder.folders, newFolder]
                }

                folders = [...folders, newFolder]
            } else {
                const folderPath = (`${path}/${directoryName}`).split('/').filter(Boolean).join('/')
                const folder = folders.find((folder) => folder.path === folderPath)

                if (isFileOfCurrentDirectory && folder) {
                    folder.files = [...folder.files, file]
                }
            }
        })
    });

    return [...folders, ...files]
}
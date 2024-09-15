import { HOME_DIRECTORY_NAME, PLACEHOLDER_FILE_NAME } from "@/constants/file-constants"
import { downloadObject, fetchObjectPaths } from "./knowledge-base/s3"
import { FileExplorerFile, FileExplorerFolder, FileExplorerItem } from "./types"
import { formatPath, getNameFromPath, slicePath } from "./path.helper"

export const previewPDF = async (path: string) => {
    const blob = await downloadObject(path)

    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
};

export const aggregateFileExplorerItems = async (userId: string): Promise<FileExplorerItem[]> => {
    const objectPaths = await fetchObjectPaths(userId)
    const files: FileExplorerFile[] = objectPaths
        .map((objectPath) => {
            return ({
                type: 'file',
                path: objectPath,
                name: getNameFromPath(objectPath)
            })
        })

    let folders: FileExplorerFolder[] = []

    files.forEach((file) => {
        const directoryNames = slicePath(file.path, 0, -1).split('/')
        directoryNames.forEach((directoryName, directoryIndex) => {
            const containsDirectoryNameInFolders = folders.some(
                (folder) => formatPath(folder.path).split('/')[directoryIndex] === directoryName
            )

            const path = slicePath(file.path, 0, directoryIndex)
            const isFileOfCurrentDirectory = formatPath(file.path).split('/').length === directoryIndex + 2
                && getNameFromPath(file.path) !== PLACEHOLDER_FILE_NAME

            if (!containsDirectoryNameInFolders) {
                const newFolder: FileExplorerItem = {
                    type: 'folder',
                    path: formatPath(`${path}/${directoryName}`),
                    name: directoryIndex === 0 ? HOME_DIRECTORY_NAME : directoryName,
                    files: isFileOfCurrentDirectory
                        ? [file]
                        : [],
                    folders: []
                }

                const previousDirectoryName = getNameFromPath(path)
                const previousFolder = folders.find((folder) => {
                    return formatPath(folder.path).split('/')[directoryIndex - 1] === previousDirectoryName
                })

                if (previousFolder) {
                    previousFolder.folders = [...previousFolder.folders, newFolder]
                }

                folders = [...folders, newFolder]
            } else {
                const folderPath = formatPath(`${path}/${directoryName}`)
                const folder = folders.find((folder) => folder.path === folderPath)

                if (isFileOfCurrentDirectory && folder) {
                    folder.files = [...folder.files, file]
                }
            }
        })
    });


    return [
        ...folders,
        ...files
    ]
}
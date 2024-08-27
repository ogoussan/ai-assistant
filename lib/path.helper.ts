export const formatPath = (path: string) =>
    path.split('/').filter(Boolean).join('/')

export const slicePath = (path: string, start?: number, end?: number) => 
    path.split('/').filter(Boolean).slice(start, end).join('/')

export const splitFileName = (name: string): [string, string] => {
    console.log('received name', name)
    const extension = name.split('.').pop() || ''
    const nameWithoutExtension = name.split('.').slice(0, -1).join('.')

    return [nameWithoutExtension, extension]
}

export const getPathFileExtension = (path: string) => path.split('.').pop() || ''

export const getNameFromPath = (path: string) => path.split('/').filter(Boolean).pop()!
export function downloadFile(url: string, fileName: string = '') {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.download = fileName
    anchor.click()
    return anchor
}

export function blobToFile(blob: Blob, fileName: string = ''): void {
    const url = URL.createObjectURL(blob)
    const anchor = downloadFile(url, fileName)
    setTimeout(() => {
        URL.revokeObjectURL(anchor.href)
        anchor.remove()
    }, 100)
}

export function openFile(accept: string) {
    return new Promise<File | null>(
        (resolve) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = accept
            input.onchange = async (event) => {
                const files = (event.target as HTMLInputElement).files
                if (files.length > 0) {
                    const file = files[0]
                    resolve(file)
                }
                else {
                    resolve(null)
                }
            }
            input.click()
        }
    )
}
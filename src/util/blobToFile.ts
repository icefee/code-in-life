export function downloadFile(url: string, fileName: string = '') {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.download = fileName
    anchor.click()
    return anchor
}

export function blobToFile(blob: Blob, fileName: string = '') {
    const url = URL.createObjectURL(blob)
    const anchor = downloadFile(url, fileName)
    setTimeout(() => {
        URL.revokeObjectURL(anchor.href)
        anchor.remove()
    }, 100)
}
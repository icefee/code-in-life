
export const isDev = process.env.NODE_ENV === 'development'

export const disableMusicProxy = process.env.DISABLE_MUSIC_PROXY === '1'

export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
}

export const isIos = () => {
    return /iP(hone|ad|od)/i.test(navigator.userAgent)
}

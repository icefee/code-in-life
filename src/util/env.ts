
export const isDev = process.env.NODE_ENV === 'development'

export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
}

import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import IframeWithoutHistory from './IframeWithoutHistory'
import { LoadingOverlay } from '../../loading'

function IframeWithLoading({ src, onLoad, style, ...props }: React.JSX.IntrinsicElements['iframe']) {

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
    }, [src])

    return (
        <Box
            sx={{
                position: 'relative',
                height: '100%'
            }}
        >
            <IframeWithoutHistory
                {...props}
                style={{
                    ...style,
                    opacity: loading ? 0 : 1
                }}
                src={src}
                onLoad={
                    (event) => {
                        setLoading(false)
                        onLoad?.(event);
                    }
                }
            />
            <LoadingOverlay
                label="加载中.."
                open={loading}
                fixed={false}
            />
        </Box>
    )
}

export default IframeWithLoading
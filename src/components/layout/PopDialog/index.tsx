import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import createTransition from '~/components/transition/Slide'

const Transition = createTransition()

interface PopDialogProps extends Omit<DialogProps, 'open' | 'onClose' | 'fullScreen' | 'PaperProps' | 'TransitionComponent'> { }

export interface PopDialogRef {
    open: VoidFunction;
    close: VoidFunction;
}

const PopDialog = forwardRef<PopDialogRef, PopDialogProps>(({ children }, ref) => {

    const [open, setOpen] = useState(false)

    const handlePopState = (_event: PopStateEvent) => {
        setOpen(false)
    }

    useImperativeHandle(ref, () => ({
        open() {
            setOpen(true)
            history.pushState(true, '', '#pop')
        },
        close() {
            history.back()
        }
    }), [])

    useEffect(() => {

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [])

    return (
        <Dialog
            fullScreen
            open={open}
            PaperProps={{
                sx: {
                    bgcolor: 'transparent',
                    backdropFilter: 'blur(4px)'
                }
            }}
            TransitionComponent={Transition}
        >
            {children}
        </Dialog>
    )
})

export default PopDialog
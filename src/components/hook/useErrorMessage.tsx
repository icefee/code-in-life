import React from 'react'
import Alert, { type AlertProps } from '@mui/material/Alert'
import Button from '@mui/material/Button'
import type { SnackbarOrigin } from '@mui/material/Snackbar'
import { useSnackbar } from './useSnackbar'

export { SnackbarProvider } from './useSnackbar'

export default function useErrorMessage() {

    const context = useSnackbar()

    const renderAlert = (props: AlertProps) => (
        <Alert {...props} />
    )

    const anchorOrigin = {
        vertical: 'bottom',
        horizontal: 'center'
    } satisfies SnackbarOrigin

    const showErrorMessage = ({
        message,
        autoHideDuration = 5e3,
        actionText = '重试',
        onAction
    }: {
        message: string;
        autoHideDuration?: number;
        actionText?: string;
        onAction?: VoidFunction;
    }) => {
        context.showSnackbar({
            anchorOrigin,
            children: renderAlert({
                variant: 'filled',
                severity: 'error',
                action: onAction ? (
                    <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        onClick={
                            () => {
                                context?.hideAll();
                                onAction();
                            }
                        }>{actionText}</Button>
                ) : null,
                children: message
            }),
            autoHideDuration
        })
    }
    return {
        anchorOrigin,
        showErrorMessage,
        renderAlert,
        ...context
    }
}

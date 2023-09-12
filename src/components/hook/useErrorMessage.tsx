import React from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useSnackbar } from './useSnackbar'

export { SnackbarProvider } from './useSnackbar'

export default function useErrorMessage() {

    const context = useSnackbar();

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
        context?.showSnackbar({
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center'
            },
            children: (
                <Alert variant="filled" severity="error" action={
                    onAction ? (
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
                    ) : null
                }>{message}</Alert>
            ),
            autoHideDuration
        })
    }
    return {
        showErrorMessage,
        ...context
    }
}

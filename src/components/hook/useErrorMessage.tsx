import React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useSnackbar } from './useSnackbar';

export { SnackbarProvider } from './useSnackbar'

export default function useErrorMessage() {

    const { showSnackbar, hideAll } = useSnackbar();

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
        showSnackbar({
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
                                    hideAll();
                                    onAction();
                                }
                            }>{actionText}</Button>
                    ) : null
                }>{message}</Alert>
            ),
            autoHideDuration
        })
    }
    return showErrorMessage;
}

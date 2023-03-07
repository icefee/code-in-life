import React, { createContext, useState, useContext } from 'react';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';

export type SnackbarOption = Exclude<SnackbarProps, 'open' | 'onClose'>

export type SnackbarContextProps = {
    // option: any;
    // setOption: React.Dispatch<SnackbarOption>;
    showSnackbar: (option: SnackbarOption) => void;
    hideAll: () => void;
}
export const SnackbarContext = createContext<SnackbarContextProps>(null)

export function SnackbarProvider({ children }) {
    const [snackbarOption, setSnackbarOption] = useState<SnackbarOption>(null)
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    return (
        <SnackbarContext.Provider value={{
            // setOption: setSnackbarOption,
            showSnackbar: (option: SnackbarOption) => {
                setSnackbarOption(option);
                setSnackbarOpen(true);
            },
            hideAll: () => setSnackbarOpen(false)
        }}>
            {children}
            {snackbarOption && <Snackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                {...snackbarOption}
            >{snackbarOption.children}</Snackbar>}
        </SnackbarContext.Provider>
    )
}

export function useSnackbar() {
    const { showSnackbar, hideAll } = useContext(SnackbarContext)
    return {
        showSnackbar,
        hideAll
    }
}

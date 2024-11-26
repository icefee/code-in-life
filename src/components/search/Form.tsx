import React, { useState, useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import NoSsr from '@mui/material/NoSsr'
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InputBase from '@mui/material/InputBase'
import { alpha } from '@mui/material/styles'
import LoadingButton, { type LoadingButtonProps } from '@mui/lab/LoadingButton'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import useLocalStorageState from '../hook/useLocalStorageState'
import { isTextNotNull } from '~/util/string'

interface SearchFormProps {
    action?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    submitText?: string;
    buttonColor?: LoadingButtonProps['color'];
    loadingSubmitText?: string;
    autocompleteKey?: string;
}

export interface Suggest {
    key: string | null;
    value: string;
}

export interface SearchFormInstance {
    putSuggest(value: string): void;
}

function SearchForm({
    action,
    value,
    onChange,
    onSubmit,
    loading = false,
    disabled = false,
    placeholder = '输入关键词搜索...',
    submitText = '搜索',
    buttonColor,
    loadingSubmitText = '搜索中',
    autocompleteKey = null
}: SearchFormProps, ref: React.ForwardedRef<SearchFormInstance>) {

    const [suggests, setSuggests] = useLocalStorageState<Suggest[]>('__autocomplete', [])
    const prevSubmitValue = useRef<string>()
    const input = useRef<HTMLInputElement | null>(null)
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)

    const filterSuggests = (sugs: Suggest[], value: string) => sugs.filter(
        sug => sug.key !== autocompleteKey || sug.value !== value
    )

    const putSuggest = (value: string) => {
        setSuggests(
            sugs => [
                {
                    key: autocompleteKey,
                    value
                },
                ...filterSuggests(sugs, value)
            ]
        )
    }

    const handleSubmit = (value: string) => {
        if (isTextNotNull(value)) {
            putSuggest(value)
            prevSubmitValue.current = value
        }
        onSubmit?.(value);
    }

    const relatedSuggests = useMemo(() => {
        return suggests.data.filter(
            ({ key }) => key === autocompleteKey
        ).map(
            ({ value }) => value
        )
    }, [autocompleteKey, suggests])

    const filteredSuggests = useMemo(() => {
        return relatedSuggests.filter(
            (option) => new RegExp(value.replace(/\\/g, '\\\\'), 'i').test(option)
        )
    }, [relatedSuggests, value])

    useImperativeHandle(ref, () => ({
        putSuggest
    }), [suggests.data])

    return (
        <NoSsr>
            <Autocomplete
                value={value}
                disabled={disabled}
                blurOnSelect
                freeSolo
                options={filteredSuggests}
                filterOptions={(o) => o}
                componentsProps={{
                    clearIndicator: {
                        size: 'large'
                    },
                    paper: {
                        sx: {
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            backgroundColor: ({ palette }) => alpha(palette.background.paper, .75),
                            backdropFilter: 'blur(4px)'
                        }
                    }
                }}
                ListboxProps={{
                    sx: {
                        py: 0
                    }
                }}
                onOpen={
                    () => setAutoCompleteOpen(true)
                }
                onClose={
                    () => setAutoCompleteOpen(false)
                }
                onKeyDown={
                    (event) => {
                        if (event.key === 'Enter' && value !== '') {
                            handleSubmit(value)
                            input.current.blur()
                        }
                    }
                }
                onInputChange={
                    (_event, value) => onChange(value)
                }
                onChange={
                    (_, value: string | null) => {
                        if (value && value !== prevSubmitValue.current) {
                            handleSubmit(value)
                        }
                        onChange(value ?? '')
                    }
                }
                renderOption={(props, option) => (
                    <ListItem
                        {...props}
                        secondaryAction={
                            <IconButton edge="end" size="small" onClick={
                                (event) => {
                                    event.stopPropagation()
                                    setSuggests(
                                        sugs => filterSuggests(sugs, option)
                                    )
                                }
                            }>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        }
                        disablePadding
                    >
                        <ListItemText primary={option} />
                    </ListItem>
                )}
                renderInput={(params) => (
                    <Paper
                        component="form"
                        action={action}
                        ref={params.InputProps.ref}
                        sx={{
                            display: 'flex',
                            width: '100%',
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, .8),
                            ...(autoCompleteOpen && filteredSuggests.length > 0 ? {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                            } : null)
                        }}
                        onSubmit={
                            (event) => {
                                if (onSubmit) {
                                    event.preventDefault()
                                    input.current.blur()
                                    handleSubmit(value)
                                }
                            }
                        }
                    >
                        <InputBase
                            sx={{ flex: 1 }}
                            placeholder={placeholder}
                            inputRef={input}
                            autoFocus
                            inputProps={{
                                style: {
                                    paddingLeft: 12
                                },
                                ...params.inputProps
                            }}
                        />
                        <LoadingButton
                            sx={{
                                p: 1.5
                            }}
                            loadingPosition="start"
                            startIcon={
                                <SearchRoundedIcon />
                            }
                            disabled={disabled}
                            loading={loading}
                            type="submit"
                            color={buttonColor}
                        >{loading ? loadingSubmitText : submitText}</LoadingButton>
                    </Paper>
                )}
            />
        </NoSsr>
    )
}

export default forwardRef<SearchFormInstance, SearchFormProps>(SearchForm)
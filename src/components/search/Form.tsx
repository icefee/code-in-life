import React, { type SyntheticEvent, useState, useRef, useMemo, forwardRef, useImperativeHandle, ForwardedRef } from 'react';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import NoSsr from '@mui/material/NoSsr';
import CloseIcon from '@mui/icons-material/Close';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import LoadingButton, { type LoadingButtonProps } from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';
import useLocalStorageState from '../hook/useLocalStorageState';
import { isTextNotNull } from '../../util/string';

interface SearchFormProps {
    action?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: (value: string) => void;
    staticFields?: Record<string, string>;
    loading?: boolean;
    placeholder?: string;
    submitText?: string;
    loadingSubmitText?: string;
    buttonColor?: LoadingButtonProps['color'];
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
    staticFields,
    loading = false,
    placeholder = '输入关键词搜索...',
    submitText = '搜索',
    loadingSubmitText = '搜索中',
    buttonColor,
    autocompleteKey = null
}: SearchFormProps, ref: ForwardedRef<SearchFormInstance>) {

    const [suggests, setSuggests] = useLocalStorageState<Suggest[]>('__autocomplete', [])
    const prevSubmitValue = useRef<string>()
    const input = useRef<HTMLInputElement>(null)
    const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)

    const putSuggest = (value: string) => {
        setSuggests(
            sugs => [{
                key: autocompleteKey,
                value
            }, ...sugs.filter(
                sug => sug.value !== value
            )]
        )
    }

    const handleSubmit = (value: string) => {
        if (isTextNotNull(value)) {
            putSuggest(value);
            prevSubmitValue.current = value;
        }
        onSubmit(value);
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
            (option) => new RegExp(value.replace('\\', '\\\\'), 'i').test(option)
        )
    }, [relatedSuggests, value])

    useImperativeHandle(ref, () => ({
        putSuggest
    }))

    return (
        <NoSsr>
            <Autocomplete
                freeSolo
                options={relatedSuggests}
                value={value}
                blurOnSelect
                componentsProps={{
                    clearIndicator: {
                        size: 'large'
                    },
                    paper: {
                        sx: {
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            backgroundColor: (theme) => alpha(theme.palette.background.paper, .75),
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
                onChange={
                    (_event: SyntheticEvent<Element, Event>, value: string | null) => {
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
                                        sugs => sugs.filter(
                                            sug => sug.key !== autocompleteKey || sug.value !== option
                                        )
                                    )
                                }
                            }>
                                <CloseIcon fontSize="small" />
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
                            (event: React.SyntheticEvent<HTMLFormElement>) => {
                                if (onSubmit) {
                                    event.preventDefault();
                                    input.current.blur();
                                    handleSubmit(value);
                                }
                            }
                        }
                    >
                        <InputBase
                            sx={{ flex: 1 }}
                            placeholder={placeholder}
                            inputRef={input}
                            type="search"
                            autoFocus
                            inputProps={{
                                style: {
                                    paddingLeft: 12
                                },
                                ...params.inputProps
                            }}
                            onChange={
                                (event: React.ChangeEvent<HTMLInputElement>) => {
                                    onChange(event.target.value)
                                }
                            }
                        />
                        {
                            staticFields && Object.entries(staticFields).map(
                                ([key, value]) => (
                                    <input key={key} type="hidden" name={key} defaultValue={value} />
                                )
                            )
                        }
                        <LoadingButton
                            loadingPosition="start"
                            startIcon={
                                <SearchIcon />
                            }
                            loading={loading}
                            type="submit"
                            color={buttonColor}
                            sx={{ p: 1.5 }}
                        >{loading ? loadingSubmitText : submitText}</LoadingButton>
                    </Paper>
                )}
            />
        </NoSsr>
    )
}

export default forwardRef<SearchFormInstance, SearchFormProps>(SearchForm);

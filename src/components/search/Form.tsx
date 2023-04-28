import React, { type SyntheticEvent, useRef, useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
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
    autocompleteKey?: string;
}

interface Suggest {
    key: string | null;
    value: string;
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
    autocompleteKey = null
}: SearchFormProps) {

    const [suggests, setSuggests] = useLocalStorageState<Suggest[]>('__autocomplete', [])
    const prevSubmitValue = useRef<string>()

    const handleSubmit = (value: string) => {
        if (isTextNotNull(value)) {
            setSuggests(
                sugs => [{
                    key: autocompleteKey,
                    value
                }, ...sugs.filter(
                    sug => sug.value !== value
                )]
            )
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

    return (
        <Autocomplete
            freeSolo
            options={relatedSuggests}
            value={value}
            onChange={
                (_event: SyntheticEvent<Element, Event>, value: string | null) => {
                    if (value && value !== prevSubmitValue.current) {
                        handleSubmit(value)
                    }
                }
            }
            renderInput={(params) => (
                <Paper
                    component="form"
                    action={action}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, .75)
                    }}
                    onSubmit={
                        (event: React.SyntheticEvent<HTMLFormElement>) => {
                            if (onSubmit) {
                                event.preventDefault();
                                handleSubmit(value);
                            }
                        }
                    }
                >
                    <InputBase
                        sx={{ flex: 1 }}
                        name="s"
                        placeholder={placeholder}
                        onChange={
                            (event: React.ChangeEvent<HTMLInputElement>) => {
                                onChange(event.target.value)
                            }
                        }
                        autoFocus
                        ref={params.InputProps.ref}
                        type="search"
                        inputProps={{
                            style: {
                                paddingLeft: 12
                            },
                            ...params.inputProps
                        }}
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
                        sx={{ p: 1.5 }}
                    >{loading ? loadingSubmitText : submitText}</LoadingButton>
                </Paper>
            )}
        />
    )
}

export default SearchForm;

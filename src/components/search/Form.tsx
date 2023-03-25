import React, { Component } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';

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
}

class SearchForm extends Component<SearchFormProps, {}> {

    public static defaultProps = {
        loading: false,
        placeholder: '输入关键词搜索...',
        submitText: '搜索',
        loadingSubmitText: '搜索中'
    }

    public render(): React.ReactNode {

        const {
            action,
            value,
            onChange,
            onSubmit,
            placeholder,
            submitText,
            loadingSubmitText,
            loading,
            staticFields
        } = this.props;

        return (
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
                            onSubmit(value);
                        }
                    }
                }
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    name="s"
                    placeholder={placeholder}
                    value={value}
                    onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) => {
                            onChange(event.target.value)
                        }
                    }
                    autoFocus
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
        )
    }
}

export default SearchForm;

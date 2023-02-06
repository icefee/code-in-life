import React, { Component } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchIcon from '@mui/icons-material/Search';

interface SearchFormProps {
    action: string;
    value: string;
    onChange: (value: string) => void;
    staticFields?: Record<string, string>;
}

class SearchForm extends Component<SearchFormProps, {}> {

    public render(): React.ReactNode {
        return (
            <Paper
                component="form"
                action={this.props.action}
                sx={(theme) => ({
                    display: 'flex',
                    width: '100%',
                    backgroundColor: alpha(theme.palette.background.paper, .6)
                })}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    name="s"
                    placeholder="输入关键词搜索..."
                    value={this.props.value}
                    onChange={
                        (event: React.ChangeEvent<HTMLInputElement>) => {
                            this.props.onChange(event.target.value)
                        }
                    }
                    autoFocus
                />
                {
                    this.props.staticFields && Object.entries(this.props.staticFields).map(
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
                    type="submit"
                    sx={{ p: 1.5 }}
                >搜索</LoadingButton>
            </Paper>
        )
    }
}

export default SearchForm;

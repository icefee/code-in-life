import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColorSpin from './circular/Color';
import { alpha } from '@mui/material/styles';

interface LoadingScreenProps {
    label?: string;
}

function LoadingScreen({ label = '数据加载中...' }: LoadingScreenProps) {
    return (
        <Stack sx={{
            height: '100%',
            backgroundImage: 'var(--linear-gradient-image)'
        }} justifyContent="center" alignItems="center">
            <Stack sx={(theme) => ({
                p: 1.5,
                backgroundColor: alpha(theme.palette.background.paper, .75),
                filter: 'drop-shadow(2px 4px 15px #00000030)',
                borderRadius: 1.5
            })} direction="row" alignItems="center" columnGap={1}>
                <ColorSpin size={32} />
                <Typography color="inherit">{label}</Typography>
            </Stack>
        </Stack>
    )
}

export default LoadingScreen;

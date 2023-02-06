import React from 'react';
import Typography, { TypographyProps } from '@mui/material/Typography';

interface RowClipTypographyProps extends TypographyProps {
    rows: number;
}

function RowClipTypography({ sx, rows, children, ...props }: RowClipTypographyProps) {
    return (
        <Typography sx={{
            ...sx,
            display: '-webkit-box',
            WebkitLineClamp: rows,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        }} {...props}>{children}</Typography>
    )
}

export default RowClipTypography;

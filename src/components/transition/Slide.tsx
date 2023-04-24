import React from 'react';
import Slide, { SlideProps } from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions'

function createTransition(direction: SlideProps['direction'] = 'up') {
    return React.forwardRef(function Transition(
        props: TransitionProps & {
            children: React.ReactElement;
        },
        ref: React.Ref<unknown>,
    ) {
        return <Slide direction={direction} ref={ref} {...props} />;
    });
}

export default createTransition;

import React, { useMemo } from 'react';

export default function IframeWithoutHistory(props: JSX.IntrinsicElements['iframe']) {
    const element = useMemo(
        () => <iframe key={props.src} {...props} />,
        [props.src]
    )
    return element;
}

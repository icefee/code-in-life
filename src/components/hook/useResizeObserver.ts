import { useState, useRef, useLayoutEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';

function useResizeObserver<T extends HTMLElement = HTMLDivElement>() {

    const wraperRef = useRef<T>()
    const [wraperSize, setWraperSize] = useState({
        width: 0,
        height: 0
    })
    const { width, height } = useWindowSize();

    useLayoutEffect(() => {
        const elm = wraperRef.current;
        setWraperSize({
            width: elm.clientWidth,
            height: elm.clientHeight
        })
    }, [width, height])

    return {
        ref: wraperRef,
        ...wraperSize
    }

}

export default useResizeObserver;

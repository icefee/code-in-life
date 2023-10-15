import { useState, useRef, useLayoutEffect } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';

function useResizeObserver<T extends HTMLElement = HTMLDivElement>() {

    const wrapperRef = useRef<T>()
    const [wraperSize, setWraperSize] = useState({
        width: 0,
        height: 0
    })
    const { width, height } = useWindowSize();

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        setWraperSize({
            width: wrapper.clientWidth,
            height: wrapper.clientHeight
        })
    }, [width, height])

    return {
        ref: wrapperRef,
        ...wraperSize
    }

}

export default useResizeObserver;

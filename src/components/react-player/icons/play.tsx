import React, { CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
    svg: {
        width: '100%',
        height: 'auto',
        color: '#fff',
        verticalAlign: 'middle',
        fill: 'currentColor',
        overflow: 'hidden'
    },
    path: {
        transition: 'all .4s'
    }
}

const path = {
    play: `M256 252.245333c0-6.613333 1.578667-13.098667 4.565333-18.901333 9.813333-18.773333 32-25.557333 49.621334-15.104l439.04 259.754667c5.973333 3.541333 10.88 8.789333 14.165333 15.146666 9.813333 18.773333 3.413333 42.453333-14.165333 52.864L310.186667 805.76a34.730667 34.730667 0 0 1-17.706667 4.906667C272.341333 810.666667 256 793.258667 256 771.797333V252.245333z`,
    pause: `M426.666667 768a42.666667 42.666667 0 0 1-42.666667 42.666667H341.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V256a42.666667 42.666667 0 0 1 42.666666-42.666667h42.666667a42.666667 42.666667 0 0 1 42.666667 42.666667v512z m298.666666 0a42.666667 42.666667 0 0 1-42.666666 42.666667h-42.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V256a42.666667 42.666667 0 0 1 42.666667-42.666667h42.666667a42.666667 42.666667 0 0 1 42.666666 42.666667v512z`
}

interface PlayIconProps {
    play: boolean;
}

function PlayIcon({ play }: PlayIconProps) {
    const d = play ? path.play : path.pause;
    return (
        <svg style={styles.svg} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path style={styles.path} d={d} />
        </svg>
    )
}

export default PlayIcon;

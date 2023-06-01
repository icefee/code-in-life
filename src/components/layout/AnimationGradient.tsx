import React, { useState, useEffect, useRef } from 'react';

const createLineGradient = (t: number) => {
    const r = Math.sin(t) * 90 + 180
    const colors = [
        `hsl(${r * .8}, 80%, 50%)`,
        `hsl(${r}, 50%, 50%)`
    ]
    return `linear-gradient(45deg, ${colors.join(', ')})`
}

function AnimationGradient() {

    const raf = useRef<number>()
    const [ts, setTs] = useState(0)

    const animate = () => {
        setTs(
            t => t + .001
        )
        raf.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        animate()
        return () => {
            cancelAnimationFrame(raf.current)
        }
    }, [])

    const lineGradient = createLineGradient(ts)

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundImage: lineGradient
            }}
        />
    )
}

export default AnimationGradient;

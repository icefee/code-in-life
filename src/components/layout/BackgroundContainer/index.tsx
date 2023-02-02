import React, { Component, PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import { Api } from '../../../util/config';
import * as css from './style.module.css';

interface BackgroundContainerProps extends PropsWithChildren<{
    prefer18?: boolean;
    style?: React.CSSProperties;
}> { }

interface BackgroundContainerState {
    blurDisabled: boolean;
    backgroundImage: string;
}

class BackgroundContainer extends Component<BackgroundContainerProps, BackgroundContainerState> {

    public state: BackgroundContainerState = {
        blurDisabled: false,
        backgroundImage: ''
    }

    constructor(props: BackgroundContainerProps) {
        super(props)
        this.state.backgroundImage = this.getNextImage()
    }

    private getRnd(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static defaultProps: Partial<BackgroundContainerProps> = {
        prefer18: false
    }

    public getNextImage(): string {
        const prefix = Api.assetSite + '/assets';
        return this.props.prefer18 ?
            `${prefix}/background_18_${this.getRnd(1, 100)}.jpg`
            : `${prefix}/background_${this.getRnd(1, 28)}.jpg`;
    }

    public setBackgroundBlur() {
        this.setState(({ blurDisabled }) => ({
            blurDisabled: !blurDisabled
        }))
    }

    public get absoluteStyle(): React.CSSProperties {
        return {
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
        }
    }

    public get backgroundImage() {
        const { backgroundImage } = this.state;
        if (backgroundImage === '') {
            return 'var(--line-gradient-image)'
        }
        return `url(${backgroundImage})`;
    }

    public render(): React.ReactNode {
        return (
            <Box className={css.container} sx={{
                position: 'relative',
                height: '100%',
                ...this.props.style
            }}>
                <Box className={css.imageLayer} sx={{
                    ...this.absoluteStyle,
                    transition: 'background-image 2.5s ease-in-out',
                    backgroundImage: this.backgroundImage,
                }} />
                <Box
                    sx={{
                        ...this.absoluteStyle,
                        transition: 'all ease .8s',
                        backdropFilter: this.state.blurDisabled ? 'none' : 'blur(10px)'
                    }}
                    onClick={this.setBackgroundBlur.bind(this)}
                />
                {this.props.children}
            </Box>
        )
    }
}

export default BackgroundContainer;

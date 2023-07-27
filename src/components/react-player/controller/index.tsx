import React, { useContext, useMemo } from 'react';
import PlayerContext from '../context';
import { type PlayerContextType } from '../type';
import { timeFormatter } from '~/util/date';
import Slide from './Slide';
import PlayIcon from '../icons/play';
import './style.css';

function Controller() {

    const { controllerShow, playState, setPlayState, videoMeta, readyState } = useContext<PlayerContextType>(PlayerContext)
    const toolbarStyle = useMemo(() => {
        if (controllerShow) {
            return {
                opacity: 1,
                transform: 'none'
            }
        }
        return {
            transitionDelay: '1s'
        }
    }, [controllerShow])

    const playStateText = useMemo(() => {
        if (!readyState.metaLoaded) {
            return '-- / --'
        }
        return timeFormatter(playState.currentTime) + ' / ' + timeFormatter(videoMeta.duration)
    }, [playState, readyState, videoMeta])

    const togglePlay = () => setPlayState(state => ({
        ...state,
        paused: !state.paused
    }))

    return (
        <div
            className="controller"
        >
            <div
                className="center-overlay"
                style={
                    controllerShow ? null : {
                        opacity: 0,
                        transitionDelay: '1s'
                    }
                }
                onClick={togglePlay}
            >
                <PlayIcon play={playState.paused} />
            </div>
            <div
                className="toolbar"
                style={toolbarStyle}
            >
                <Slide />
                <div className="bottom-bar">
                    <div className="play-btn" onClick={togglePlay}>
                        <PlayIcon play={playState.paused} />
                    </div>
                    <div className="time">
                        {playStateText}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Controller;

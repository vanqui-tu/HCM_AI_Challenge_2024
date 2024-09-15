"use client";
import { Typography } from '@components/Typography';
import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { VideoYoutubeProps } from './types';

export function VideoYoutube({ intervalRef, stopInterval, videoUrl, startTime, width, height, fps, currentVideoFrame, setCurrentVideoFrame }: VideoYoutubeProps) {
    const playerRef = useRef<any>(null);

    // Extract the video ID from the YouTube URL
    const videoId = videoUrl.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    const cleanVideoId = ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;

    // Options for the YouTube player
    const opts = {
        height: height.toString(),
        width: width.toString(),
        playerVars: {
            autoplay: 1,
            start: Math.floor(startTime), // Convert start time to an integer
        },
    };

    const onReady = (event: any) => {
        playerRef.current = event.target;

        if (startTime % 1 !== 0) {
            playerRef.current.seekTo(startTime, true);
        }

        // Start updating the current frame every 100 milliseconds
        if (intervalRef.current === undefined) {
            intervalRef.current = window.setInterval(() => {
                const currentTime = playerRef.current.getCurrentTime();
                const currentFrame = Math.floor(currentTime * fps);
                setCurrentVideoFrame(currentFrame);
                console.log('Current Time: ', currentTime, 'Current Frame: ', currentFrame);
            }, 100);
        }
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current !== undefined) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        };
    }, [intervalRef]);

    useEffect(() => {
        stopInterval();
    }, [stopInterval]);

    return (
        <div style={{ position: 'relative' }}>
            <YouTube videoId={cleanVideoId} opts={opts} onReady={onReady} />
            <div style={{
                position: 'absolute',
                inset: '20px 20px auto auto',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '15px',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
            >
                <Typography style={{
                    color: 'white',
                }}>
                    Current Frame: {currentVideoFrame}
                </Typography>
            </div>
        </div>
    );
}


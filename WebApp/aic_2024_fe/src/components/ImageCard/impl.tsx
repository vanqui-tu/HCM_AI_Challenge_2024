"use client";
import {
    FullscreenOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SaveOutlined,
    YoutubeOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons';
import { Button, Image, Tooltip, Typography } from '@components';
import { useNotif } from '@contexts';
import { Space } from 'antd';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles.scss';
import { ImageCardProps } from './types';
import { VideoYoutube } from './VideoYoutube';

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
    function ImageCard({
        type,
        id,
        videoName,
        frame,
        thumbnail,
        title,
        youtubeUrl,
        startTime,
        fps,
        metadata,
        className,
        style
    }, ref) {
        // Refs
        const imageCardRef = useRef<HTMLDivElement>(null);
        const othersRef = useRef<HTMLDivElement>(null);
        const intervalRef = useRef<number | undefined>(undefined); // Ref to manage the interval

        // States
        const [openAsVideo, setOpenAsVideo] = useState(false);
        const [currentVideoFrame, setCurrentVideoFrame] = useState<number>(frame);

        const [hover, setHover] = useState(false);
        const [othersHeight, setOthersHeight] = useState(0);
        // const [width, setWidth] = useState(0);
        // const height = useMemo(() => width * 2 / 3, [width]);

        const { open } = useNotif()
        const contentStyles = useMemo(() => (hover ?
            {
                inset: `auto 0 0 0`
            } :
            {
                inset: `auto 0 ${-1 * (othersHeight + 16)}px 0`
            }),
            [hover, othersHeight]);

        const uploadStyles = useMemo(() => (hover ?
            {
                inset: '16px 24px auto auto',
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            } :
            {
                inset: '-32px 24px auto auto',
                opacity: 0,
            }),
            [hover]);

        const previewStyles = useMemo(() => (hover ?
            {
                inset: '16px 72px auto auto',
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            } :
            {
                inset: '-32px 72px auto auto',
                opacity: 0,
            }),
            [hover]);

        const utubeStyles = useMemo(() => (hover ?
            {
                inset: '16px 120px auto auto',
                opacity: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
            } :
            {
                inset: '-32px 120px auto auto',
                opacity: 0,
            }),
            [hover]);

        const triggerClick = useCallback(() => {
            const syntheticEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });

            const img = document.getElementById(`image-card-${id}`);
            if (img) {
                img.dispatchEvent(syntheticEvent);
            }
        }, [id]);

        const onClickOpenUtube = useCallback(() => {
            setOpenAsVideo(true);
            triggerClick();
        }, [triggerClick]);

        const handleResize = useCallback(() => {
            setOthersHeight(othersRef.current ? othersRef.current.clientHeight : 0);
            // setWidth(imageCardRef.current?.clientWidth ?? 0);
        }, []);

        const onSubmit = useCallback((id: string) => {
            navigator.clipboard.writeText(`${videoName}, ${currentVideoFrame}`)
                .then(() => {
                    open({
                        type: 'success',
                        message: `Save as ${videoName}, ${currentVideoFrame}`
                    });
                })
                .catch((err) => {
                    console.error('Failed to copy text: ', err);
                    open({
                        type: 'error',
                        message: `Got error when saving as csv`
                    });
                });
        }, [currentVideoFrame, open, videoName]);

        useEffect(() => {
            if (type) {
                handleResize();
                setOthersHeight(othersRef.current ? othersRef.current.clientHeight : 0);
            }
        }, [handleResize, type]);

        useEffect(() => {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, [handleResize]);

        // Function to stop the interval
        const stopInterval = useCallback(() => {
            if (intervalRef.current !== undefined) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        }, []);

        return (
            <div
                className={`image-card ${className}`}
                style={style}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                ref={imageCardRef}
            >
                <Image
                    id={`image-card-${id}`}
                    width='100%'
                    height='100%'
                    alt={title}
                    src={thumbnail}
                    preview={{
                        destroyOnClose: true,
                        onVisibleChange: (visible: boolean, prevVisible: boolean) => {
                            if (!visible) {
                                setOpenAsVideo(false);
                                stopInterval();
                                setCurrentVideoFrame(frame);
                            }
                        },
                        // Renderer
                        imageRender: openAsVideo ?
                            (originalNode: React.ReactElement) => {
                                return <VideoYoutube
                                    currentVideoFrame={currentVideoFrame}
                                    setCurrentVideoFrame={setCurrentVideoFrame}
                                    videoUrl={youtubeUrl}
                                    startTime={startTime}
                                    fps={fps ?? 25}
                                    width={1280 * 2 / 3}
                                    height={720 * 2 / 3}
                                    intervalRef={intervalRef}
                                    stopInterval={stopInterval}
                                />
                            } : undefined,

                        toolbarRender: (
                            _,
                            {
                                transform: { scale },
                                actions: { onRotateLeft, onRotateRight, onZoomOut, onZoomIn, },
                            },
                        ) => (
                            <Space size={12} className="toolbar-wrapper">
                                <RotateLeftOutlined onClick={onRotateLeft} width={30} height={30} />
                                <RotateRightOutlined onClick={onRotateRight} />
                                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                                {/* <UploadOutlined onClick={() => onSubmit(id)} /> */}
                                <SaveOutlined onClick={() => onSubmit(id)} />
                            </Space>
                        ),
                    }}
                    loading='lazy'
                    className='image-card__thumbnail'
                />
                <div className='image-card__shadow' />
                <div
                    className='image-card__content'
                    style={contentStyles}
                >
                    <div
                        className='image-card__content__metadata'
                    >
                        <Typography
                            type='title' level={type === 'large' ? 4 : 5} className='image-card__content__metadata__title'
                        >
                            {title}
                        </Typography>
                        {
                            metadata && <div
                                className='image-card__content__metadata__others'
                                ref={othersRef}
                            >
                                {metadata}
                            </div>
                        }
                    </div>
                </div>

                <Tooltip title='Open youtube video'>
                    <Button type='link' onClick={onClickOpenUtube} className='image-card__utube' style={utubeStyles}>
                        <YoutubeOutlined />
                    </Button>
                </Tooltip>


                <Tooltip title='Open preview image'>
                    <Button type='link' onClick={triggerClick} className='image-card__preview' style={previewStyles}>
                        <FullscreenOutlined />
                    </Button>
                </Tooltip>


                <Tooltip title='Save as CSV'>
                    <Button
                        type='link'
                        className='image-card__upload'
                        style={uploadStyles}
                        onClick={() => onSubmit(id)}
                    >
                        {/* <Icon name='upload-outlined' /> */}
                        <SaveOutlined />
                    </Button>
                </Tooltip>
            </div >
        )
    })
import React from 'react'
import classNames from 'classnames/bind';
import styles from '../styles/VideoDetails.module.css'
import { useSearchParams } from 'react-router-dom'
import YouTubeVideo from '../components/YoutubeVideo';

const cx = classNames.bind(styles);
var videoId = ""
var frameIdx = 0
var start = 0.0
var fps = 25
var name = ""
var sessionID = ""
const VideoDetails = () => {
    console.log(window.location.href)
    const [searchParams, setSearchParams] = useSearchParams();
    videoId = searchParams.get("videoId")
    frameIdx = parseInt(searchParams.get("frameIdx"))
    start = searchParams.get("start")
    fps = searchParams.get("fps")
    name = searchParams.get("name")
    sessionID = searchParams.get("sessionid")
    const url = `https://www.youtube.com/embed/${videoId}?start=${start}`
    console.log(url)
    return (
        <div className={cx('main')}>
            <YouTubeVideo videoId={videoId} start={start} fps={fps} name={name} sessionID={sessionID}></YouTubeVideo>
        </div>
    )
}

export default VideoDetails
import classNames from 'classnames/bind';
import styles from '../styles/YoutubeVideo.module.css'
import React, { Component, useState } from 'react';
import YouTube from 'react-youtube';
const cx = classNames.bind(styles);

class YouTubePlayer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentTime: 0
        };

        // YouTube video options
        this.opts = {
            height: '480',
            width: '720',
            playerVars: {
                // Add your YouTube API key here if not using environment variables
                // key: 'YOUR_API_KEY',
                // Other player options
                key: 'AIzaSyD2YYWQNQhpPRUdz7FoxLWGVP1wjJ2DXjQ'
            },
        };

        this.videoId = props.videoId
        this.start = props.start;
        this.name = props.name
        this.fps = props.fps;
        this.sessionID = props.sessionID;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        console.log(`${this.name} ${Number(Number(this.state.currentTime) * this.fps).toFixed()} ${this.sessionID}`)
        try {
            fetch('https://eventretrieval.one/api/v1/submit?' + new URLSearchParams({
                item: this.name,
                frame: Number(Number(this.state.currentTime) * this.fps).toFixed(),
                session: this.sessionID
            })).then(response => response.json())
                .then(data => {
                    console.log(Object.values(data))
                    this.setState({ results: data })

                })
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Event handler for when the YouTube player is ready
    onReady(event) {
        // Get a reference to the YouTube player
        this.setState({ player: event.target });

        // Start the video at the specific time (e.g., 23.3 seconds)
        event.target.seekTo(this.start);

        // Start tracking the time periodically
        this.trackTime();
    }

    // Event handler for tracking current time
    onPlay() {
        // Use the YouTube Player API to get the current time
        const currentTime = this.state.player.getCurrentTime();

        // Update the currentTime state with the current time of the video
        this.setState({ currentTime });
    }

    // Periodically update the current time while the video is playing
    trackTime() {
        this.intervalId = setInterval(() => {
            this.onPlay();
        }, 100); // Update every 0.1 second
    }

    // Clear the interval when the component unmounts
    componentWillUnmount() {
        clearInterval(this.intervalId);
    }


    render() {
        if (this.state.results) {
            console.log(typeof this.state.results)
            console.log(`results: ${Object.keys(this.state.results)}`)
            console.log(`results: ${Object.values(this.state.results)}`)
        }
        return (

            <div className={cx('video-details-container')}>
                <div className={cx('video-container')}>
                    <YouTube
                        videoId={this.videoId}
                        opts={this.opts}
                        onReady={(e) => this.onReady(e)}
                        onPlay={(e) => this.onPlay(e)} // Set the onPlay event handler for tracking time
                    />
                </div>
                <div className={cx('video-details')}>
                    <div className={cx('video-infos')}>
                        <div className={cx('video-infos-header')}>
                            <div className={cx('video-name')}>{(this.name)}</div>
                            <form method="GET" onSubmit={(e) => this.handleFormSubmit(e)}>
                                <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-cloud-upload" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                                        <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                                    </svg>
                                </button>
                                <span>
                                    Submit answer
                                </span>
                            </form>
                        </div>
                        <div className={cx('video-time')}>Current time: <span>{Number(this.state.currentTime).toFixed(2)}s</span></div>
                        <div className={cx('video-time')}>Current frame: <span>{Number(Number(this.state.currentTime) * this.fps).toFixed()}</span></div>
                    </div>
                    <div className={cx('video-results')}>
                        {this.state.results ?
                            Object.values(this.state.results).length === 3 ?
                                Object.values(this.state.results)[0] == "CORRECT" &&
                                Object.values(this.state.results)[1] == "Submission correct!" ?
                                    <div className={cx('submission-successed')}>
                                        CORRECT!
                                    </div> :
                                    <div className={cx('submission-failed')}>
                                        FALSE!
                                    </div> :
                               Object.values(this.state.results).length === 2
                                    &&
                                    Object.values(this.state.results)[0].includes("rejected by filter: Duplicate submission") ? <div className={cx('submission-failed')}>
                                    Duplicate submission!
                                </div> : ""
                            : ""}
                    </div>
                </div>
            </div>
        );
    }
}

export default YouTubePlayer;

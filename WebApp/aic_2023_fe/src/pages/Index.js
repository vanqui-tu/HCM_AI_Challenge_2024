import classNames from 'classnames/bind';
import React, { useState, useEffect } from 'react';
import styles from '../styles/Index.module.css'
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import Notification from "../components/SubmitingNotification";
// import Papa from "papaparse";
const cx = classNames.bind(styles);

const Index = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchAudioQuery, setSearchAudioQuery] = useState('');
    // const [firstSearchAudioQuery, setFirstSearchAudioQuery] = useState('');
    const [keyframes, setDetailKeyframes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allObjects, setAllObjects] = useState(false);
    const [detailObjects, setDetailObjects] = useState([]);
    const [filterObjects, setFilterObjects] = useState([])
    const [checkedIds, setCheckedIds] = useState([]);
    const [minScore, setMinScore] = useState(40);
    const [searchTime, setSearchTime] = useState(0)
    // const [showVoiceSearch1, setShowVoiceSearch1] = useState(false)
    const [showVoiceSearch2, setShowVoiceSearch2] = useState(false)
    const [sessionID, setSessionID] = useState({})
    const getSessionIdUrl = "https://eventretrieval.one/api/v1/login"
    const [submitResult, setSubmitResult] = useState({})

    const [showAlert, setShowAlert] = useState(false);

    const topks = [100, 200, 300, 400, 500, 100]
    // TODO: Khởi tạo các tài nguyên mặc định cho UI
    useEffect(() => {
        // Define the API endpoint you want to call
        const apiUrl = 'http://127.0.0.1:5000/initial'; // Replace with your API endpoint

        // Make the API request
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                // Assuming the API response contains an array of image URLs
                setDetailKeyframes(data.detail_keyframes)
                setDetailObjects(data.objects)
                setFilterObjects(data.objects)
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });

        fetch(getSessionIdUrl, {
            method: "POST",
            body: JSON.stringify({
                username: process.env.REACT_APP_USERNAME,
                password: process.env.REACT_APP_PASSWORD
            })
        }).then(response => response.json())
            .then(data => {
                console.log(`Session ID: ${data.sessionId}`)
                console.log(Object.values(data))
                setSessionID(data)
                var notify;
                if (Object.values(data).length === 4 &&
                    data.username === process.env.REACT_APP_USERNAME) {
                    notify = () => toast.success("Get session ID: SUCCESSFUL!", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                else {
                    notify = () => toast.error("Get session ID: FAILED!", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                notify()
            })

    }, []);

    // TODO: Tạo 1 connect qua giao thức socket
    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('connect', () => {
            console.log("Connected to server");
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleCheckboxChange = (id) => {
        if (checkedIds.includes(id)) {
            // If the ID is already in the checkedIds array, remove it
            setCheckedIds(checkedIds.filter((checkedId) => checkedId !== id));
        } else {
            // If the ID is not in the checkedIds array, add it
            setCheckedIds([...checkedIds, id]);
        }
    };

    const handleRangeChange = (e) => {
        // Update the range values in the state
        if (e.target.value >= 40) {
            setMinScore(e.target.value);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Form submitted with searchQuery:', searchQuery);
        console.log('Form submitted with searchAudioQuery:', searchAudioQuery);
        // console.log('Form submitted with firstSearchAudioQuery:', firstSearchAudioQuery);

        try {
            var startTime = performance.now()
            const socket = io('http://localhost:5000');
            socket.emit('search', { searchQuery, searchAudioQuery });
            socket.on('search_result', (data) => {
                setDetailKeyframes(data.data)
                setLoading(false);
            });

            socket.on('search_error', (error) => {
                console.error('Server error:', error);
                setLoading(false);
            });

            var endTime = performance.now()
            console.log(((endTime - startTime) / 1000))
            setSearchTime(((endTime - startTime) / 1000).toFixed(5))
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFormSubmitAnswer = async (e, name, currentFrame, sessionId) => {
        e.preventDefault();
        console.log(`${name} ${currentFrame} ${sessionId}`)
        try {
            fetch('https://eventretrieval.one/api/v1/submit?' + new URLSearchParams({
                item: name,
                frame: currentFrame,
                session: sessionId
            })).then(response => response.json())
                .then(data => {
                    console.log(Object.values(data))
                    setSubmitResult(data)
                    var notify;
                if (Object.values(data).length >= 2 &&
                Object.values(data)[0] == "CORRECT") {
                    notify = () => toast.success(Object.values(data)[0], {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                else {
                    notify = () => toast.error(Object.values(data)[0], {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                notify()
                })

        } catch (error) {
            console.error('Error:', error);
        }

        // toast.success('Form submitted successfully!', {
        //     position: 'top-right', // You can change the notification position
        //     autoClose: 3000, // Notification will automatically close after 3 seconds
        //   });
    };


    // console.log(Object.keys(submitResult))

    return (
        <div className={cx("container")}>
            <div className={cx("sidebar")}>
                <label className={cx("checkbox")} for="allObjects">
                    <input
                        id="allObjects"
                        type="checkbox"
                        checked={allObjects}
                        onChange={() => setAllObjects(!allObjects)}
                    />
                    Show all objects
                </label>
                <label className={cx("score-box")}>
                    <input
                        type="range"
                        name="min"
                        value={minScore}
                        min={0}
                        max={100}
                        onChange={handleRangeChange}
                    />
                    <p>
                        Score: {minScore / 100}
                    </p>
                </label>
                <div className={cx('object-container')}>
                    <div className={cx('search-object-container')}>
                        <input type="text" placeholder='Search object...' onChange={(event) => {
                            setFilterObjects(detailObjects.filter((value) => {
                                return value[0].toString().includes(event.target.value) || value[1].toString().includes(event.target.value);
                            }))
                        }} />
                        <div onClick={() => {
                            setCheckedIds([])
                        }}>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                </svg>
                            </button>
                            <span>Remove all filters</span>
                        </div>
                    </div>
                    <ul className={cx("detail-objects")}>
                        {filterObjects.map((item, idx) => (
                            <li key={item.id} className={cx("detail-object")}>
                                <input
                                    type="checkbox"
                                    checked={checkedIds.includes(item[0])}
                                    name={idx}
                                    id={idx}
                                    onChange={() => handleCheckboxChange(item[0])}
                                />
                                <label className={cx("checkmark")} for={idx}>
                                    <div>{item[0]}</div>
                                    <div>{item[1]}</div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {loading ? (
                <div className={cx('loading-container')}>
                    <div className={cx("lds-grid")} ><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                </div>
            ) : (
                <div className={cx("main-box")}>
                    <div className={keyframes.length > 0 ? cx("search-container") : cx("search-container-nothing")}>
                        <form className={cx("search-box")} onSubmit={handleFormSubmit}>
                            {/* <input type="text"
                                className={showVoiceSearch1 ? cx("search-voice-input") : cx("voice-input--not-show")}
                                name="voice-search-1"
                                placeholder="Filter by voice text first..."
                                value={firstSearchAudioQuery}
                                onChange={(e) => {
                                    setFirstSearchAudioQuery(e.target.value)
                                    setSearchAudioQuery("")
                                }}
                            /> */}
                            <div className={cx("main-search-container")}>

                                {/* <div className={cx("voice-search-control-1")}>
                                    <div onClick={() => {
                                        console.log("Show search text 1")
                                        setShowVoiceSearch1(true)
                                    }}> <img src="/add.png" /> </div>
                                    <div onClick={() => {
                                        console.log("Hide search text 1")
                                        setShowVoiceSearch1(false)
                                        setFirstSearchAudioQuery("")
                                    }}> <img src="/minus.png" /> </div>
                                </div> */}

                                <input type="text" name="search"
                                    placeholder="Search (Put the '@' between two sentences if you search in sequence)"
                                    className={cx("search-input")} value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autofocus
                                />
                                <a className={cx("search-icon")} onClick={handleFormSubmit}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                    </svg>
                                </a>

                                <div className={cx("voice-search-control-2")}>
                                    <div onClick={() => {
                                        console.log("Show search text 2")
                                        setShowVoiceSearch2(true)

                                    }}> <img src="/add.png" /> </div>
                                    <div onClick={() => {
                                        console.log("Hide search text 2")
                                        setShowVoiceSearch2(false)
                                        setSearchAudioQuery("")
                                    }}> <img src="/minus.png" /> </div>
                                </div>
                                <button style={{
                                    display: 'none'
                                }} type="submit"></button>


                            </div>

                            <input type="text"
                                className={showVoiceSearch2 ? cx("search-voice-input") : cx("voice-input--not-show")}
                                name="voice-search-2"
                                placeholder="Filter by voice text (seperate by '@')"
                                value={searchAudioQuery}
                                onChange={(e) => {
                                    setSearchAudioQuery(e.target.value)
                                }}
                            />
                        </form>
                        <p className={cx('time')}>(About {searchTime} seconds)</p>
                    </div>
                    <div className={cx("keyframe-grid")}>
                        {keyframes.slice(0, Math.min(keyframes.length, 250)).map((keyframe, idx) => {

                            let check = checkedIds.length === 0 || checkedIds.every(id => keyframe["o"].some(obj => obj["i"] === id));
                            if (check) {
                                return (

                                    <div className={cx("keyframe-container")} key={idx}>
                                        <div className={cx("image-box")}>
                                            <img src={`http://127.0.0.1:5000/static/${keyframe['v']}/${keyframe["i"]}.jpg`} alt="My Image" />
                                            <div className={cx("bounding-boxes")}>
                                                {allObjects ? (
                                                    <div className={cx("bounding-boxes")}>
                                                        {keyframe["o"].map((box, boxIndex) => {

                                                            let score = minScore / 100
                                                            if (box["s"] >= score) {

                                                                if (checkedIds.length == 0 || checkedIds.includes(box["i"])) {
                                                                    // Image: 400 x 224
                                                                    let ymin = box["b"][0] * 280;
                                                                    let xmin = box["b"][1] * 500;
                                                                    let ymax = box["b"][2] * 280;
                                                                    let xmax = box["b"][3] * 500;

                                                                    return (
                                                                        <div
                                                                            className={cx("bounding-box")}
                                                                            key={boxIndex}
                                                                            style={{
                                                                                left: xmin + 'px',
                                                                                top: ymin + 'px',
                                                                                width: (xmax - xmin) + 'px',
                                                                                height: (ymax - ymin) + 'px',
                                                                            }}
                                                                        ></div>
                                                                    )
                                                                }
                                                            }
                                                        })}
                                                    </div>
                                                ) : (<div></div>)}
                                            </div>
                                        </div>
                                        <div className={cx("keyframe-info")}>
                                            <span>Video: {keyframe["v"]}</span>
                                            <span>Keyframe: {keyframe["f"]}</span>
                                            <span>Time: {keyframe["t"]}s</span>
                                        </div>
                                        <a href={`/videos?videoId=${keyframe["l"]}&frameIdx=${keyframe["f"]}&start=${keyframe["t"]}&fps=${keyframe['fps'] === undefined ? 25 : keyframe["fps"]}&name=${keyframe["v"]}&sessionid=${sessionID.sessionId}`} target="_blank">Xem chi tiết</a>

                                        <form className={cx('submit-form')} method="GET" onSubmit={(e) => handleFormSubmitAnswer(e, keyframe["v"], keyframe["f"], sessionID.sessionId)}>
                                            <button>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-cloud-upload" viewBox="0 0 16 16">
                                                    <path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                                                    <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z" />
                                                </svg>
                                            </button>
                                            <span>
                                                Submit answer
                                            </span>
                                            <input value={keyframe["v"]}></input>
                                            <input value={keyframe["f"]}></input>
                                            <input value={sessionID.sessionId}></input>
                                        </form>

                                    </div>
                                )

                            }
                        })}
                    </div >

                </div>
            )}      
            <Notification/>
  
        </div>


    );
}

export default Index
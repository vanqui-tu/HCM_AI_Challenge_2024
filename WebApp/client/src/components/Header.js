import classNames from 'classnames/bind';
import styles from '../styles/Header.module.css';
import { Link } from 'react-router-dom'
import React from 'react';
// import config from './config';

const cx = classNames.bind(styles);

function Header() {
    return (
        <div className={cx("header")}>
            <div className={cx("left-content")}>
                <Link to="/">
                    <img src="https://www.fit.hcmus.edu.vn/assets/img/logos/fit-logo-white.png" alt="AIC Logo" />
                </Link>
                <span>AIC 2023</span>
            </div>
            <div className={cx("right-content")}>
                <span>PTQ.US</span>
            </div>
        </div>
    );
}

export default Header;
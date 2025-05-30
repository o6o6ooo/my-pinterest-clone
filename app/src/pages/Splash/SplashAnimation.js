import React from 'react';
import styles from './Splash.module.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashAnimation() {

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/invite'); // 👈 招待コード画面へ遷移
        }, 3000); // 3秒後に遷移

        return () => clearTimeout(timer); // クリーンアップ
    }, [navigate]);  

    return (
        <div className="relative flex justify-center items-center h-screen bg-[#A5C3DE]">
            <img src="/logobase.png" alt="logo" className="w-32 h-32" />
            <div className={styles['orbit-wrapper']}>
                <div className={`${styles.dot} ${styles.dot1}`}></div>
                <div className={`${styles.dot} ${styles.dot2}`}></div>
                <div className={`${styles.dot} ${styles.dot3}`}></div>
            </div>
        </div>
    );
}
import React from 'react';
import styles from './Splash.module.css';

export default function SplashAnimation() {
    return (
        <div className={styles.animatedPart}>
            {/* ロゴの一部や画像をここに */}
            <img src="/logo192.png" alt="Logo" />
        </div>
    );
}
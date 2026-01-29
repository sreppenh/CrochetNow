import React, { useState, useEffect } from 'react';
import styles from './WakeLockBanner.module.css';

const STORAGE_KEY = 'crochetnow_wakelock_activated';

/**
 * One-time banner prompting user to activate wake lock
 * Keeps screen awake while crocheting
 */
function WakeLockBanner({ wakeLockRef, onSuccess }) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        // Check if user has already activated or dismissed wake lock
        const hasActivated = localStorage.getItem(STORAGE_KEY);
        if (hasActivated) {
            setIsDismissed(true);
        }
    }, []);

    const handleActivate = async () => {
        setIsActivating(true);

        // Check if Wake Lock API is supported
        if (!('wakeLock' in navigator)) {
            console.warn('Wake Lock API not supported in this browser');
            setIsActivating(false);
            return;
        }

        try {
            // Request wake lock DIRECTLY in the click handler
            const wakeLock = await navigator.wakeLock.request('screen');

            console.log('✓ Screen wake lock active');
            wakeLockRef.current = wakeLock;

            // Listen for release
            wakeLock.addEventListener('release', () => {
                console.log('Wake lock released');
                wakeLockRef.current = null;
            });

            // Remember activation
            localStorage.setItem(STORAGE_KEY, 'true');

            // Notify parent
            if (onSuccess) {
                onSuccess();
            }

            // Show success briefly, then dismiss
            setTimeout(() => {
                setIsDismissed(true);
            }, 1500);

        } catch (err) {
            console.warn(`Wake lock request failed: ${err.name}`);
            setIsActivating(false);
        }
    };

    const handleDismiss = () => {
        // Remember that user dismissed (don't show again)
        localStorage.setItem(STORAGE_KEY, 'dismissed');
        setIsDismissed(true);
    };

    // Don't show if dismissed
    if (isDismissed) {
        return null;
    }

    return (
        <div className={styles.backdrop}>
            <div className={styles.modal}>
                {/* Icon */}
                <div className={styles.icon}>
                    {isActivating ? '✨' : '☀️'}
                </div>

                {/* Title */}
                <h2 className={styles.title}>
                    {isActivating ? 'Activating...' : 'Keep Your Screen Awake'}
                </h2>

                {/* Description */}
                {!isActivating && (
                    <p className={styles.description}>
                        CrochetNow can keep your screen on while you crochet, so you don't have to keep unlocking your phone between rounds.
                    </p>
                )}

                {isActivating && (
                    <p className={styles.success}>
                        Screen wake lock activated! ✓
                    </p>
                )}

                {/* Activate Button */}
                {!isActivating && (
                    <>
                        <button
                            onClick={handleActivate}
                            className={styles['activate-button']}
                        >
                            Keep Screen Awake
                        </button>

                        {/* Dismiss Link */}
                        <button
                            onClick={handleDismiss}
                            className={styles['dismiss-button']}
                        >
                            No thanks
                        </button>
                    </>
                )}

                {/* Info Text */}
                <p className={styles['info-text']}>
                    This only works while CrochetNow is open.
                </p>
            </div>
        </div>
    );
}

export default WakeLockBanner;


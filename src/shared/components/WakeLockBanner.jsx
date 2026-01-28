import React, { useState, useEffect } from 'react';

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
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px'
            }}
        >
            <div
                style={{
                    maxWidth: '400px',
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    border: '3px solid #FF6B6B'
                }}
            >
                {/* Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {isActivating ? '✨' : '☀️'}
                </div>

                {/* Title */}
                <h2
                    style={{ 
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '12px',
                        color: '#374151'
                    }}
                >
                    {isActivating ? 'Activating...' : 'Keep Your Screen Awake'}
                </h2>

                {/* Description */}
                {!isActivating && (
                    <p
                        style={{ 
                            fontSize: '1rem',
                            marginBottom: '24px',
                            color: '#6B7280',
                            lineHeight: '1.6'
                        }}
                    >
                        CrochetNow can keep your screen on while you crochet, so you don't have to keep unlocking your phone between rounds.
                    </p>
                )}

                {isActivating && (
                    <p
                        style={{ 
                            fontSize: '1rem',
                            marginBottom: '24px',
                            color: '#10b981',
                            lineHeight: '1.6',
                            fontWeight: '600'
                        }}
                    >
                        Screen wake lock activated! ✓
                    </p>
                )}

                {/* Activate Button */}
                {!isActivating && (
                    <>
                        <button
                            onClick={handleActivate}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                backgroundColor: '#FF6B6B',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#FF5252'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B6B'}
                        >
                            Keep Screen Awake
                        </button>

                        {/* Dismiss Link */}
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#9CA3AF',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                        >
                            No thanks
                        </button>
                    </>
                )}

                {/* Info Text */}
                <p
                    style={{
                        color: '#9CA3AF',
                        fontSize: '12px',
                        marginTop: '16px',
                        lineHeight: '1.5'
                    }}
                >
                    This only works while CrochetNow is open.
                </p>
            </div>
        </div>
    );
}

export default WakeLockBanner;

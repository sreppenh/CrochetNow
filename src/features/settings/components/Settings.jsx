import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';

function Settings() {
    const navigate = useNavigate();
    const [showFullText, setShowFullText] = useState(false);

    // Load setting from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('crochet_show_full_text');
        if (saved !== null) {
            setShowFullText(saved === 'true');
        }
    }, []);

    // Save setting to localStorage when it changes
    const handleToggle = (checked) => {
        setShowFullText(checked);
        localStorage.setItem('crochet_show_full_text', checked.toString());
    };

    return (
        <div className={styles.settings}>
            {/* Header */}
            <div className={styles.header}>
                <button
                    className={styles.backButton}
                    onClick={() => navigate('/')}
                    aria-label="Back to home"
                >
                    ←
                </button>
                <h1 className={styles.title}>Settings</h1>
                <div className={styles.spacer} />
            </div>

            {/* Settings Content */}
            <div className={styles.content}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Display</h2>
                    
                    <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                            <div className={styles.settingLabel}>Show Full Text</div>
                            <div className={styles.settingDescription}>
                                Display full stitch names instead of abbreviations
                            </div>
                        </div>
                        
                        {/* Toggle Switch */}
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                checked={showFullText}
                                onChange={(e) => handleToggle(e.target.checked)}
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    {/* Example Display */}
                    <div className={styles.example}>
                        <div className={styles.exampleLabel}>Example:</div>
                        <div className={styles.exampleText}>
                            {showFullText ? '6 double crochet in magic ring' : '6 dc in MR'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p className={styles.footerText}>More settings coming soon! 🧶</p>
            </div>
        </div>
    );
}

export default Settings;

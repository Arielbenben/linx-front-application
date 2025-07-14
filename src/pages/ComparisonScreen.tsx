import { useState } from 'react';
import styles from './ComparisonScreen.module.css';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ComparisonChart from './Charts/ScrVsOthersChart';

export default function ComparisonScreen() {
    const { smbName } = useUser();
    const navigate = useNavigate();

    const customDate = new Date(2025, 6, 13); // חודש 5 (מאי) הוא 4, יום 31
    const formattedCustomDate = customDate.toLocaleDateString('he-IL');


    const [timeRange, setTimeRange] = useState<'חודשי' | 'שנתי'>('שנתי');
    const [dataType, setDataType] = useState<'קונים' | 'מכירות' | 'המלצות'>('מכירות');

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.header}>
                    <h3 className={styles.title}>השוואת מכירות/קונים/המלצות</h3>
                    <span className={styles.arrow} onClick={() => navigate('/dashboard')}>{'< Back'}</span>
                </div>

                <hr className={styles.separator} />

                <div className={styles.topRow}>
                    <div className={styles.businessInfo}>
                        <p className={styles.businessName}>{smbName || 'שם העסק'}</p>
                        <p className={styles.date}>{formattedCustomDate}</p>
                    </div>
                    <img className={styles.logo} src="/linx-logo.png" alt="logo" />
                </div>

                <div className={styles.buttonRow}>
                    <button
                        className={`${styles.selectButton} ${timeRange === 'שנתי' ? styles.selectButtonActive : ''}`}
                        onClick={() => setTimeRange('שנתי')}
                    >
                        שנתי
                    </button>
                    <button
                        className={`${styles.selectButton} ${timeRange === 'חודשי' ? styles.selectButtonActive : ''}`}
                        onClick={() => setTimeRange('חודשי')}
                    >
                        חודשי
                    </button>
                </div>

                <div className={styles.buttonRow}>
                    <button
                        className={`${styles.selectButton} ${dataType === 'מכירות' ? styles.selectButtonActive : ''}`}
                        onClick={() => setDataType('מכירות')}
                    >
                        מכירות
                    </button>
                    <button
                        className={`${styles.selectButton} ${dataType === 'קונים' ? styles.selectButtonActive : ''}`}
                        onClick={() => setDataType('קונים')}
                    >
                        קונים
                    </button>
                    <button
                        className={`${styles.selectButton} ${dataType === 'המלצות' ? styles.selectButtonActive : ''}`}
                        onClick={() => setDataType('המלצות')}
                    >
                        המלצות
                    </button>
                </div>

                <div className={styles.highlight}>
                    {timeRange} - <span className={styles.highlight}>{dataType}</span>
                </div>

                <div className={styles.graphBox}>
                    <ComparisonChart timeRange={timeRange} dataType={dataType} />
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import styles from './SelfSalesComprison.module.css';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import SalesForecastChart from './Charts/SalesForecastChart';


export default function SalesForecast() {
    const { smbId, smbName, isInitialized } = useUser(); 
    const navigate = useNavigate();
    const formattedDate = new Date().toLocaleDateString('he-IL');
    const [timeRange, setTimeRange] = useState<'חודשי' | 'שבועי'>('שבועי');

    if (!isInitialized) {
        return <div className={styles.spinner}></div>; 
    }

    if (!smbId) {
        return <div className={styles.error}>לא נמצא מזהה עסק</div>; 
    }

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div className={styles.header}>
                    <h3 className={styles.title}>תחזית תשואה לעסק</h3>
                    <span className={styles.arrow} onClick={() => navigate('/dashboard')}>{'< Back'}</span>
                </div>

                <hr className={styles.separator} />

                <div className={styles.topRow}>
                    <div className={styles.businessInfo}>
                        <p className={styles.businessName}>{smbName || 'שם העסק'}</p>
                        <p className={styles.date}>{formattedDate}</p>
                    </div>
                    <img className={styles.logo} src="/linx-logo.png" alt="logo" />
                </div>

                <div className={styles.buttonRow}>
                    <button
                        className={`${styles.selectButton} ${timeRange === 'שבועי' ? styles.selectButtonActive : ''}`}
                        onClick={() => setTimeRange('שבועי')}
                    >
                        שבועי
                    </button>
                    <button
                        className={`${styles.selectButton} ${timeRange === 'חודשי' ? styles.selectButtonActive : ''}`}
                        onClick={() => setTimeRange('חודשי')}
                    >
                        חודשי
                    </button>
                </div>

                <div className={styles.highlight}>
                    {timeRange} - תחזית תשואה לעסק
                </div>

                <div className={styles.graphBox}>
                    <SalesForecastChart timeRange={timeRange} />
                </div>
            </div>
        </div>
    );
}

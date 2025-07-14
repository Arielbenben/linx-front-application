import { useState } from 'react';
import styles from './NewReturningCustomersVsOthers.module.css';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import NewReturningCustomersChart from './Charts/NewReturningCustomersChart';

export default function ComparisonScreen() {
  const { smbName } = useUser();
  const navigate = useNavigate();
  const customDate = new Date(2025, 6, 13); // חודש 5 (מאי) הוא 4, יום 31
  const formattedCustomDate = customDate.toLocaleDateString('he-IL');

  const [timeRange, setTimeRange] = useState<'חודשי' | 'שנתי'>('חודשי');

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>לקוחות חדשים/חוזרים</h3>
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
            className={`${styles.selectButton} ${timeRange === 'חודשי' ? styles.selectButtonActive : ''}`}
            onClick={() => setTimeRange('חודשי')}
          >
            חודשי
          </button>
          <button
            className={`${styles.selectButton} ${timeRange === 'שנתי' ? styles.selectButtonActive : ''}`}
            onClick={() => setTimeRange('שנתי')}
          >
            שנתי
          </button>
        </div>

        <div className={styles.highlight}>
          {timeRange} - לקוחות חדשים/חוזרים
        </div>

        <div className={styles.graphBox}>
          <NewReturningCustomersChart timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
}

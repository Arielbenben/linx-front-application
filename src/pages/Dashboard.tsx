import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useUser } from '../context/UserContext';
import WeeklyComparisonChart from './Charts/ScrVsOthersChart';
import SalesForecastChart from './Charts/SalesForecastChart';
import MonthlyNewReturningCustomersChart from './Charts/NewReturningCustomersChart';
import WeeklySelfSalesComprisonChart from './Charts/SelfSalesComprisonChart';

export default function DashboardScreen() {
    const { smbName } = useUser();
    const navigate = useNavigate();
    const formattedDate = new Date().toLocaleDateString('he-IL');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.businessDetails}>
                    <p className={styles.businessName}>{smbName || 'שם העסק'}</p>
                    <p className={styles.date}>{formattedDate}</p>
                </div>
                <img src="/linx-logo.png" alt="Linx Logo" className={styles.logo} />
            </div>

            <div
                className={`${styles.card} ${styles.clickableCard}`}
                onClick={() => navigate('/comparison')}
            >
                <p className={styles.cardTitle}>השוואת מכירות/קונים/המלצות</p>
                <p className={styles.cardSubtitle}>שבועי - קונים</p>
                <div className={styles.chartPlaceholder}>
                    <WeeklyComparisonChart timeRange="שבועי" dataType="קונים" />
                </div>
            </div>

            <div className={styles.grid2}>
                <div
                    className={`${styles.card} ${styles.clickableCard}`}
                    onClick={() => navigate('/SalesForecast')}
                >
                    <p className={styles.cardTitle}>תחזית תשואה בעסק</p>
                    <p className={styles.cardSubtitle}>חודשי</p>
                    <div className={styles.chartPlaceholder}>
                        <SalesForecastChart timeRange="שבועי" />
                    </div>
                </div>
                <div
                    className={`${styles.card} ${styles.clickableCard}`}
                    onClick={() => navigate('/SelfSalesComprison')}
                >
                    <p className={styles.cardTitle}>מכירות העסק בהשוואה לעומת העבר</p>
                    <p className={styles.cardSubtitle}>שבועי</p>
                    <div className={styles.chartPlaceholder}>
                        <WeeklySelfSalesComprisonChart timeRange="שבועי" />
                    </div>
                </div>
            </div>

            <div
                className={`${styles.cardBigger} ${styles.clickableCard}`}
                onClick={() => navigate('/NewReturning')}
            >
                <p className={styles.cardTitle}>לקוחות חדשים/חוזרים</p>
                <p className={styles.cardSubtitle}>חודשי</p>
                <div className={styles.graphBox}>
                    <MonthlyNewReturningCustomersChart timeRange="חודשי" />
                </div>
            </div>

            <div className={styles.navbar}>
                <button
                    className={styles.navButtonActive}
                    onClick={() => navigate('/dashboard')}
                >
                    כללי
                </button>
                <button
                    className={styles.navButton}
                    onClick={() => navigate('/Profile')}
                >
                    פרופיל
                </button>
            </div>
        </div>
    );
}

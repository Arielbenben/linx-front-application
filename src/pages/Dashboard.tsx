import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useUser } from '../context/UserContext';
import WeeklyComparisonChart from './Charts/ScrVsOthersChart';
import MonthlyNewReturningCustomersChart from './Charts/NewReturningCustomersChart';
import WeeklySelfSalesComprisonChart from './Charts/SelfSalesComprisonChart'

export default function DashboardScreen() {
    const { smbName } = useUser();
    const [activeTab, setActiveTab] = useState<'main' | 'profile'>('main');
    const navigate = useNavigate();
    const formattedDate = new Date().toLocaleDateString('he-IL');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <p className={styles.businessName}>{smbName || 'שם העסק'}</p>
                    <p className={styles.date}>{formattedDate}</p>
                </div>
                <div className={styles.header}>
                    <img src="/linx-logo.png" alt="Linx Logo" className={styles.logo} />
                </div>
            </div>

            {activeTab === 'main' && (
                <>
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
                            onClick={() => navigate('/comparison')}
                        >
                            <p className={styles.cardTitle}>תחזית תשואה בעסק</p>
                            <p className={styles.cardSubtitle}>חודשי</p>
                            <div className={styles.chartPlaceholder}>[גרף תחזית]</div>
                        </div>
                        <div
                            className={`${styles.card} ${styles.clickableCard}`}
                            onClick={() => navigate('/SelfSalesComprison')}
                        >
                            <p className={styles.cardTitle}>מכירות העסק בהשוואה לעומת העבר</p>
                            {/* <p className={styles.cardTitle}>לקוחות חדשים/חוזרים</p> */}
                            <p className={styles.cardSubtitle}>שבועי</p>
                            <div className={styles.chartPlaceholder}>
                                {/* <MonthlyNewReturningCustomersChart timeRange="חודשי" /> */}
                                <WeeklySelfSalesComprisonChart timeRange='שבועי' />
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${styles.cardBigger} ${styles.clickableCard}`}
                        onClick={() => navigate('/NewReturning')}
                    >
                        {/* <p className={styles.cardTitle}>מכירות העסק בהשוואה לעומת העבר</p> */}
                        <p className={styles.cardTitle}>לקוחות חדשים/חוזרים</p>
                        <p className={styles.cardSubtitle}>חודשי</p>
                        <div className={styles.graphBox}>
                            <MonthlyNewReturningCustomersChart timeRange="חודשי" />
                            {/* <WeeklySelfSalesComprisonChart timeRange='שבועי' /> */}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'profile' && (
                <div className={styles.card}>
                    <p className={styles.cardTitle}>פרופיל עסק</p>
                    <div className={styles.chartPlaceholder}>[פרטי העסק יוצגו כאן]</div>
                </div>
            )}

            <div className={styles.navbar}>
                <button
                    className={activeTab === 'main' ? styles.navButtonActive : styles.navButton}
                    onClick={() => setActiveTab('main')}
                >
                    כללי
                </button>
                <button
                    className={activeTab === 'profile' ? styles.navButtonActive : styles.navButton}
                    onClick={() => setActiveTab('profile')}
                >
                    פרופיל
                </button>
            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import { useUser } from '../context/UserContext';
import { useState } from 'react';

export default function DashboardProfile() {
    const navigate = useNavigate();
    const {
        smbName,
        smbCategory,
        ownerName,
        smbAddress,
        smbPhoneNumber,
        smbPassword,
        setSmbName,
        setSmbPassword,
        setSmbCategory,
        setOwnerName,
        setSmbAddress,
        setSmbPhoneNumber,
    } = useUser();

    const [editProfileMode, setEditProfileMode] = useState(false);
    const [editPasswordMode, setEditPasswordMode] = useState(false);
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [requestText, setRequestText] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    const handleSendRequest = () => {
        if (requestText.trim().length === 0) return;
        setRequestSent(true);
        setTimeout(() => {
            setRequestSent(false);
            setRequestText('');
        }, 5000);
    };

    const [formData, setFormData] = useState({
        smbName: smbName || '',
        smbCategory: (smbCategory || []).join(', '),
        ownerName: ownerName || '',
        smbAddress: smbAddress || '',
        smbPhoneNumber: smbPhoneNumber || '',
        smbPassword: smbPassword || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        setSmbName(formData.smbName);
        setSmbCategory(
            formData.smbCategory
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0)
        );
        setOwnerName(formData.ownerName);
        setSmbAddress(formData.smbAddress);
        setSmbPhoneNumber(formData.smbPhoneNumber);
        setEditProfileMode(false);
    };

    const handleSavePassword = () => {
        setSmbPassword(formData.smbPassword);
        setEditPasswordMode(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.businessDetails}>
                    <p className={styles.businessName}>{smbName || 'שם העסק'}</p>
                    <p className={styles.date}>{new Date().toLocaleDateString('he-IL')}</p>
                </div>
                <img src="/linx-logo.png" alt="Linx Logo" className={styles.logo} />
            </div>

            <div className={styles.cardBigger}>
                <p className={styles.cardTitle}>פרופיל:</p>
                <div className={styles.chartPlaceholder}>
                    <div className={styles.innerProfileBox}>
                        {editProfileMode ? (
                            <>
                                {[{ label: 'שם העסק', name: 'smbName' },
                                { label: 'קטגוריה', name: 'smbCategory' },
                                { label: 'שם הבעלים', name: 'ownerName' },
                                { label: 'כתובת', name: 'smbAddress' },
                                { label: 'טלפון', name: 'smbPhoneNumber' }]
                                    .map(({ label, name }) => (
                                        <div className={styles.inputGroup} key={name}>
                                            <label className={styles.inputLabel} htmlFor={name}>{label}</label>
                                            <input
                                                id={name}
                                                name={name}
                                                type="text"
                                                className={styles.inputField}
                                                value={formData[name as keyof typeof formData]}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    ))}
                                <button className={styles.saveButton} onClick={handleSaveProfile}>
                                    שמור פרופיל
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>שם העסק:</span>
                                    <span className={styles.value}>{smbName}</span>
                                </div>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>קטגוריה:</span>
                                    <span className={styles.value}>{(smbCategory || []).join(', ')}</span>
                                </div>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>שם הבעלים:</span>
                                    <span className={styles.value}>{ownerName}</span>
                                </div>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>כתובת:</span>
                                    <span className={styles.value}>{smbAddress}</span>
                                </div>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>טלפון:</span>
                                    <span className={styles.phoneValue}>{smbPhoneNumber}</span>
                                </div>
                                <button className={styles.editButton} onClick={() => setEditProfileMode(true)}>
                                    ערוך פרופיל
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.cardBigger}>
                <p className={styles.cardTitle}>הגדרות:</p>
                <div className={styles.chartPlaceholderSettings}>
                    <div className={styles.innerProfileBox}>

                        <div className={styles.toggleRow}>
                            <span className={styles.key}>התראות</span>
                            <label className={styles.toggleSwitch}>
                                <input
                                    type="checkbox"
                                    checked={notificationsOn}
                                    onChange={() => setNotificationsOn(!notificationsOn)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {editPasswordMode ? (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel} htmlFor="smbPassword">סיסמא</label>
                                    <input
                                        id="smbPassword"
                                        name="smbPassword"
                                        type="text"
                                        className={styles.inputField}
                                        value={formData.smbPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button className={styles.saveButton} onClick={handleSavePassword}>
                                    שמור סיסמא
                                </button>
                            </>
                        ) : (
                            <>
                                <div className={styles.textRow}>
                                    <span className={styles.key}>סיסמא:</span>
                                    <span className={styles.value}>
                                        {'●'.repeat(smbPassword?.length || 8)}
                                    </span>
                                </div>
                                <button className={styles.editButton} onClick={() => setEditPasswordMode(true)}>
                                    החלף סיסמא
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className={styles.cardBigger}>
                <p className={styles.cardTitle}>יצירת קשר:</p>
                <div className={styles.chartPlaceholderInnerContact}>
                    <div className={styles.innerProfileBox}>
                        {requestSent ? (
                            <p className={styles.sentMessage}>✔ הבקשה נשלחה בהצלחה!</p>
                        ) : (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel} htmlFor="request">בקשה</label>
                                    <textarea
                                        id="request"
                                        name="request"
                                        value={requestText}
                                        onChange={(e) => setRequestText(e.target.value)}
                                        className={styles.requestBox}
                                        placeholder="כתוב/כתבי את הבקשה כאן..."
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleSendRequest}
                                        disabled={requestText.trim().length < 1}
                                    >
                                        שליחת בקשה
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


            <div className={styles.navbar}>
                <button className={styles.navButton} onClick={() => navigate('/dashboard')}>
                    כללי
                </button>
                <button className={styles.navButtonActive} onClick={() => navigate('/dashboard/profile')}>
                    פרופיל
                </button>
            </div>
        </div>
    );
}

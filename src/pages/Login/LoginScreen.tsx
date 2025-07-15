import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import styles from './LoginScreen.module.css';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginScreen() {
    const navigate = useNavigate();
const { 
    setSmbId, 
    setSmbName, 
    setOwnerName, 
    setSmbAddress, 
    setSmbCategory, 
    setSmbPhoneNumber,
    setSmbPassword 
} = useUser();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setErrorMessage('');
        setLoading(true);

        const url = 'http://192.168.33.12:8080/api/auth/';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner_full_name: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data['is_password_correct']) {
                setErrorMessage('שם המשתמש או הסיסמה שגויים');
            } else {
                setSmbId(data['smb_id']);
                setSmbName(data['smb_name']);
                setOwnerName(data['owner_full_name'])
                setSmbAddress(data['smb_address'])
                setSmbPhoneNumber(data['smb_phone_number'])
                setSmbPassword(password)
                setSmbCategory(Array.isArray(data['categories']) ? data['categories'] : null);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('API login error:', error);
            setErrorMessage('אירעה שגיאה בשרת');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src="/linx-logo.png" alt="Linx Logo" className={styles.logoIcon} />
                <h1 className={styles.logo}>Linx BI</h1>
                <h2 className={styles.title}>Sign In</h2>
                <hr className={styles.line} />

                <div className={styles.inputContainer}>
                    <FaUser className={styles.icon} />
                    <input
                        className={styles.textInput}
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className={styles.inputContainer}>
                    {showPassword ? (
                        <FaEyeSlash className={styles.icon} onClick={() => setShowPassword(false)} style={{ cursor: 'pointer' }} />
                    ) : (
                        <FaEye className={styles.icon} onClick={() => setShowPassword(true)} style={{ cursor: 'pointer' }} />
                    )}
                    <input
                        className={styles.textInput}
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

                {loading ? (
                    <div className={styles.spinner}></div>
                ) : (
                    <button
                        className={styles.button}
                        onClick={handleLogin}
                        disabled={!(username && password)}
                    >
                        Sign In
                    </button>
                )}

            </div>
        </div>
    );
}

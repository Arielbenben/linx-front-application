import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { useUser } from '../../context/UserContext';
import styles from './Chart.module.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type TimeRange = 'שנתי' | 'חודשי';

interface ChartProps {
    timeRange: TimeRange;
}

function getApiUrl(timeRange: TimeRange, smbId: number): string {
    const base = 'http://192.168.33.12:8080/api/analyze/new-customers/';
    return `${base}${timeRange === 'חודשי' ? 'monthly' : 'yearly'}/${smbId}`;
}

let myNew: number[] = [];
let myReturning: number[] = [];
let othersNew: number[] = [];
let othersReturning: number[] = [];

function buildChartData(apiData: any[], smbName: string) {
    const labels = apiData.map(item => {
        if (item.week) {
            // במקרה של 'חודשי', הצגת טווח השבועות כפי שהיה (ללא שינוי)
            const date = new Date(item.week);

            // חישוב תחילת וסוף השבוע בציר ה-X בפורמט "19-25/05" (ללא השנה)
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - date.getDay()); // תחילת השבוע (יום ראשון)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // הוספת 6 ימים לסוף השבוע (יום שבת)

            const startDay = String(startOfWeek.getDate()).padStart(2, '0');
            const endDay = String(endOfWeek.getDate()).padStart(2, '0');
            const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');

            return `${endDay}.${month} - ${startDay}.${month}`;  // כמו "19-25/05"
        } else if (item.month) {
            // במקרה של 'שנתי', הצגת החודש בקיצור והצגת 25 או 24 לפי השנה
            const date = new Date(item.month);
            const currentYear = new Date().getFullYear();
            const monthShort = date.toLocaleString('he-IL', { month: 'short' });  // קיצור החודש בעברית

            // קביעת היום (אם השנה הנוכחית הצג 25, אם שנה קודמת הצג 24)
            const day = (date.getFullYear() === currentYear) ? '25' : '24';

            return `${monthShort} ${day}`;  // כמו "ינו' 25", "פבר' 24"
        }
        return '';  // ברירת מחדל אם אין נתונים
    });

    myNew = apiData.map(item => item.smb_target.avg_new_customers);
    myReturning = apiData.map(item => item.smb_target.avg_returning_customers);
    othersNew = apiData.map(item => item.others.avg_new_customers);
    othersReturning = apiData.map(item => item.others.avg_returning_customers);

    return {
        labels,
        datasets: [
            {
                label: ` חדשים`,
                data: myNew,
                borderColor: '#00aaff',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3,
            },
            {
                label: `        ${smbName || 'העסק שלי'}:   חוזרים`,
                data: myReturning,
                borderColor: '#0077cc',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3,
            },
            {
                label: ' חדשים',
                data: othersNew,
                borderColor: '#ff9900',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3,
            },
            {
                label: 'עסקים דומים:   חוזרים',
                data: othersReturning,
                borderColor: '#cc6600',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3,
            },
        ],
    };
}

export default function NewReturningCustomersChart({ timeRange }: ChartProps) {
    const { smbId, smbName } = useUser();
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (!smbId) return;

        const cacheKey = `newReturningChart-${smbId}-${timeRange}`;
        const cachedRaw = localStorage.getItem(cacheKey);

        if (cachedRaw) {
            try {
                const cachedObj = JSON.parse(cachedRaw);
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;

                if (now - cachedObj.timestamp < oneHour) {
                    setChartData(cachedObj.data);
                    return;
                } else {
                    localStorage.removeItem(cacheKey);
                }
            } catch {
                localStorage.removeItem(cacheKey);
            }
        }

        setChartData(null);
        const url = getApiUrl(timeRange, smbId);
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const parsed = buildChartData(data, smbName || '');
                setChartData(parsed);
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: parsed,
                    timestamp: Date.now(),
                }));
            });
    }, [timeRange, smbId]);

    if (!chartData) return <div className={styles.spinner}></div>;

    return (
        <Line
            data={chartData}
            options={{
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#333',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        rtl: true,
                        textDirection: 'rtl',
                        callbacks: {
                            title: (context: any) => {
                                // השתמש ב-context[0] אם יש יותר מ-1 טוליפ
                                const label = context[0]?.label || '';
                                return label;  // הצגת התאריך או החודש עם השנה
                            },
                            label: (context: any) => {
                                const value = Math.round(context.raw).toLocaleString('he-IL');  // במקום context.formattedValue
                                const businessType = context.dataset.label;

                                const isNew = businessType.includes('חדשים');

                                if (isNew) {
                                    return `לקוחות חדשים: ${value}`;
                                } else {
                                    return `לקוחות ישנים: ${value}`;
                                }
                            }

                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            usePointStyle: true,
                            pointStyle: 'line',
                            font: {
                                size: 14,
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: '#ccc' },
                        grid: { display: false },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'מספר לקוחות',
                            color: '#fff',
                            font: {
                                size: 16,
                                weight: 'bold',
                            },
                        },
                        ticks: { color: '#ccc' },
                        grid: {
                            color: '#444',
                            drawBorder: false,
                        } as any,
                    },
                },
            }}
        />
    );
}

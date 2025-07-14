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

type TimeRange = 'שבועי' | 'חודשי';

interface ChartProps {
    timeRange: TimeRange;
}

function getApiUrl(timeRange: TimeRange, smbId: number): string {
    const base = 'http://192.168.33.10:8080/api/analyze/sales-forecast/';
    return `${base}${timeRange === 'שבועי' ? 'weekly' : 'monthly'}/${smbId}`;
}

function buildChartData(apiData: any[], smbName: string) {
    const labels = apiData.map(item => {
        const dateStr = item.date;
        const date = new Date(dateStr);

        // שמות הימים בעברית
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const dayName = dayNames[date.getDay()];

        // תאריך בפורמט DD.MM
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dateFormatted = `${day}.${month}`;

        return `${dayName} - ${dateFormatted}`;
    });

    const predictedSales = apiData.map(item => item.predicted_transactions);

    return {
        labels,
        datasets: [
            {
                label: `${smbName || 'העסק שלי'}: תחזית עסקאות`,
                data: predictedSales,
                borderColor: '#00c853',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                borderWidth: 3,
            },
        ],
    };
}

export default function SalesForecastChart({ timeRange }: ChartProps) {
    const { smbId, smbName } = useUser();
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (!smbId) return;

        const cacheKey = `salesForecastChart-${smbId}-${timeRange}`;
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
                            label: function (context) {
                                const value = Math.round(context.parsed.y);
                                return ` תחזית: ${value} עסקאות`;
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
                        title: {
                            display: true,
                            text: 'תאריך',
                            color: '#fff',
                            font: {
                                size: 16,
                                weight: 'bold',
                            },
                        },
                        ticks: { color: '#ccc' },
                        grid: { display: false },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'מספר עסקאות',
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
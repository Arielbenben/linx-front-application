import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { useUser } from '../../context/UserContext';
import styles from './Chart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type TimeRange = 'שנתי' | 'חודשי' | 'שבועי';

interface ChartProps {
    timeRange: TimeRange;
}

function getApiUrl(timeRange: TimeRange = 'שבועי', smbId: number): string {
    const base = 'https://render-d9ko.onrender.com/api/analyze/sales/';
    const path =
        timeRange === 'חודשי' ? 'monthly' :
            timeRange === 'שנתי' ? 'yearly' :
                'weekly';
    return `${base}${path}/${smbId}`;
}

function buildChartData(apiData: any[], timeRange: TimeRange): any {
    let labels: string[] = [];
    let currentData: number[] = [];
    let previousData: number[] = [];

    if (timeRange === 'שבועי') {
        labels = apiData.map(item => item.week);
        currentData = apiData.map(item => item.current_week);
        previousData = apiData.map(item => item.previous_week);
    } else if (timeRange === 'חודשי') {
        labels = apiData.map(item => item.week_range_current_month);
        currentData = apiData.map(item => item.current_month_week_sales);
        previousData = apiData.map(item => item.previous_month_week_sales);
    } else if (timeRange === 'שנתי') {
        labels = apiData.map(item => item.month);
        currentData = apiData.map(item => item.sales_2023);
        previousData = apiData.map(item => item.sales_2022);
    }

    return {
        labels,
        datasets: [
            {
                label: timeRange === 'שנתי' ? '2022' : 'השבוע הקודם',
                data: previousData,
                backgroundColor: '#0077cc',
                borderWidth: 1,
            },
            {
                label: timeRange === 'שנתי' ? '2023' : 'השבוע הזה',
                data: currentData,
                backgroundColor: '#00aaff',
                borderWidth: 1,
            }
        ],
    };
}

export default function NewReturningCustomersChart({ timeRange }: ChartProps) {
    const { smbId, isInitialized } = useUser();
    const [chartData, setChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // ✅ cache זמני
    const cacheRef = useRef<Map<string, any>>(new Map());

    if (!isInitialized) return null;
    if (!smbId) return <div className={styles.spinner}></div>;

    useEffect(() => {
        const cacheKey = `selfSalesChart-${smbId}-${timeRange}`;

        // ✅ נבדוק קודם ב-localStorage
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
            try {
                const cachedObj = JSON.parse(cachedRaw);
                const now = Date.now();
                const oneHour = 60 * 60 * 1000;
                if (now - cachedObj.timestamp < oneHour) {
                    setChartData(cachedObj.data);
                    setLoading(false);
                    return;
                } else {
                    localStorage.removeItem(cacheKey);
                }
            } catch {
                localStorage.removeItem(cacheKey);
            }
        }

        // ✅ נבדוק גם בזיכרון זמני
        if (cacheRef.current.has(cacheKey)) {
            setChartData(cacheRef.current.get(cacheKey));
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const fetchData = async () => {
            try {
                setLoading(true);
                const url = getApiUrl(timeRange, smbId);
                const res = await fetch(url, { signal });
                const data = await res.json();
                const parsed = buildChartData(data, timeRange);

                // שמירה בזיכרון זמני + localStorage
                cacheRef.current.set(cacheKey, parsed);
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: parsed,
                    timestamp: Date.now(),
                }));

                setChartData(parsed);
                setLoading(false);
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('🚨 שגיאת טעינה:', error);
                    setChartData(null);
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            controller.abort();
        };
    }, [timeRange, smbId]);

    if (loading || !chartData) return <div className={styles.spinner}></div>;

    return (
        <Bar
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
                            title: () => '',
                            label: (context: any) => {
                                const value = context.formattedValue;
                                const fullLabel = context.label || '';
                                const monthOnly = fullLabel.split(' ')[0];
                                return `${monthOnly}: ${value}`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            usePointStyle: false,
                            font: { size: 14 },
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: '#ccc' },
                        grid: { display: false },
                    },
                    y: {
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

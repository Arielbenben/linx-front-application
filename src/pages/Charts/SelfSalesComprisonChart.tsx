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
    const base = 'http://192.168.33.10:8080/api/analyze/sales/';
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
        const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

        labels = apiData.map(item => {
            const date = new Date(item.date);
            const dayName = dayNames[date.getDay()];
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${dayName} - ${day}.${month}`; // הצגת יום-חודש
        });
        currentData = apiData.map(item => item.current_week);
        previousData = apiData.map(item => item.previous_week);
    } else if (timeRange === 'חודשי') {
        labels = apiData.map(item => {
            const weekRange = item.week_range_current_month.split('/')[0];
            const month = item.week_range_current_month.split('/')[1];
            return `${weekRange}/${month}`;  // הצגת טווח השבועות + חודש
        });

        currentData = apiData.map(item => item.current_month_week_sales);
        previousData = apiData.map(item => item.previous_month_week_sales);
    } else if (timeRange === 'שנתי') {
        // מיפוי אינדקס החודשים לצורך המיון
        const monthToIndex: {[key: string]: number} = {
            "ינואר": 0, "פברואר": 1, "מרץ": 2, "אפריל": 3, "מאי": 4, "יוני": 5,
            "יולי": 6, "אוגוסט": 7, "ספטמבר": 8, "אוקטובר": 9, "נובמבר": 10, "דצמבר": 11
        };

        // איסוף כל השנים הייחודיות מהנתונים
        const allYears = new Set<number>();
        apiData.forEach(item => {
            item.sales.forEach((sale: any) => allYears.add(sale.year));
        });
        
        // מיון הנתונים לפי חודש (כרונולוגי)
        const sortedData = apiData.sort((a, b) => {
            // מציאת השנה המאוחרת ביותר עבור כל חודש
            const aLatestYear = Math.max(...a.sales.map((s: any) => s.year));
            const bLatestYear = Math.max(...b.sales.map((s: any) => s.year));
            
            // אם השנים שונות, למיין לפי שנה
            if (aLatestYear !== bLatestYear) {
                return aLatestYear - bLatestYear;
            }
            
            // אם השנים זהות, למיין לפי חודש
            return monthToIndex[a.month] - monthToIndex[b.month];
        });

        // יצירת labels (רק שמות החודשים)
        labels = sortedData.map(item => item.month);
        
        // יצירת נתונים עבור השנה הנוכחית (הגבוהה יותר)
        currentData = sortedData.map(item => {
            const latestYear = Math.max(...item.sales.map((s: any) => s.year));
            const latestSale = item.sales.find((s: any) => s.year === latestYear);
            return latestSale?.sales || 0;
        });
        
        // יצירת נתונים עבור השנה הקודמת
        previousData = sortedData.map(item => {
            const latestYear = Math.max(...item.sales.map((s: any) => s.year));
            const previousYear = latestYear - 1;
            const previousSale = item.sales.find((s: any) => s.year === previousYear);
            return previousSale?.sales || 0;
        });
    }

    return {
        labels,
        datasets: [
            {
                label: timeRange === 'שנתי' ? 'שנה קודמת' :
                    timeRange === 'חודשי' ? 'החודש הקודם' :
                        'השבוע הקודם',
                data: previousData,
                backgroundColor: '#005f8d',
                borderWidth: 1,
            },
            {
                label: timeRange === 'שנתי' ? 'שנה נוכחית' :
                    timeRange === 'חודשי' ? 'החודש הזה' :
                        'השבוע הזה',
                data: currentData,
                backgroundColor: '#00aaff',
                borderWidth: 1,
            }
        ]
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
                                return `${monthOnly}: ${value} ש"ח`;
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
                        title: {
                            display: true,
                            text: 'מכירות בשקלים',
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
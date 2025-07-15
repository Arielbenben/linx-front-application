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

type DataType = 'מכירות' | 'קונים' | 'המלצות';
type TimeRange = 'שנתי' | 'חודשי';

interface ComparisonChartProps {
  timeRange: TimeRange;
  dataType: DataType;
}

function getApiUrl(timeRange: TimeRange, dataType: DataType, smbId: number): string {
  const base = 'http://192.168.33.12:8080/api/analyze/';
  const path = {
    'קונים': 'compare-customers',
    'מכירות': 'compare-sales',
    'המלצות': 'compare-recommendations',
  }[dataType];
  return `${base}${path}/${timeRange === 'שנתי' ? 'monthly' : 'weekly'}/${smbId}`;
}

function buildComparisonChartData(apiData: any[], dataType: DataType, smbName: string, timeRange: TimeRange) {
  let sortedData = apiData;

  if (timeRange === 'שנתי') {
    // מיון התאריכים כך שהחודשים יוצגו בסדר כרונולוגי (מהחודש הכי ישן ועד הכי חדש)
    sortedData = apiData.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }

  const labels = sortedData.map(item => {
    const date = new Date(item.start_date);
    const month = date.getMonth(); // חודש (מתחיל מ-0)

    // אם timeRange == 'שנתי', הצג את החודש בקיצור עם סימן קיצור ואת השנה
    if (timeRange === 'שנתי') {
      const options: Intl.DateTimeFormatOptions = { month: 'short', year: '2-digit' };  // חודש בקיצור ושנה ב-2 ספרות
      return date.toLocaleDateString('he-IL', options);  // יניב תוצאה כמו "ינו׳ 25"
    }

    const day = String(date.getDate()).padStart(2, '0');
    const startMonth = String(date.getMonth() + 1).padStart(2, '0'); // חודש של תחילת השבוע
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + 6); // הוספת 6 ימים לסיום השבוע
    const endDay = String(endOfWeek.getDate()).padStart(2, '0');

    // אם timeRange == 'חודשי', הצג את תחילת וסוף השבוע בצורה של "04-11/07"
    if (timeRange === 'חודשי') {
      return `${endDay}.${startMonth} - ${day}.${startMonth}`;  // תחילת וסוף השבוע + חודש
    }

    // במקרה של timeRange == 'שבועי', הצג את היום-חודש כמו "01-07"
    return `${day}-${String(month + 1).padStart(2, '0')}`; // הצגת יום-חודש
  });

  let myData: number[] = [];
  let othersData: number[] = [];

  // כאן אנחנו מחשבים את המידע שברצוננו להציג בגרף
  switch (dataType) {
    case 'מכירות':
      myData = sortedData.map(item => item.my_total_transaction_amount);
      othersData = sortedData.map(item => item.similar_avg_transaction_amount);
      break;
    case 'קונים':
      myData = sortedData.map(item => item.my_customers_count);
      othersData = sortedData.map(item => item.similar_avg_customers_count);
      break;
    case 'המלצות':
      myData = sortedData.map(item => item.my_recommendations_count);
      othersData = sortedData.map(item => item.similar_avg_recommendations_count);
      break;
  }

  return {
    labels,
    datasets: [
      {
        label: smbName || 'העסק שלי',
        data: myData,
        borderColor: '#00aaff',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'עסקים דומים',
        data: othersData,
        borderColor: '#ff9900',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };
}

export default function ComparisonChart({ timeRange, dataType }: ComparisonChartProps) {
  const { smbId, smbName } = useUser();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!smbId) return;

    const cacheKey = `chartData-${smbId}-${dataType}-${timeRange}`;
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
          localStorage.removeItem(cacheKey); // ניקוי אם פג
        }
      } catch (e) {
        localStorage.removeItem(cacheKey); // במקרה של פורמט פגום
      }
    }

    setChartData(null);
    const url = getApiUrl(timeRange, dataType, smbId);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const parsed = buildComparisonChartData(data, dataType, smbName || '', timeRange);
        setChartData(parsed);
        localStorage.setItem(cacheKey, JSON.stringify({
          data: parsed,
          timestamp: Date.now(),
        }));
      });
  }, [timeRange, dataType, smbId]);

  if (!chartData) return <div className={styles.spinner}></div>;

  return (
    <Line
      data={chartData}
      // בקובץ ComparisonChart.tsx, החלף את הקוד של options בחלק הטולטיפ:

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
                // הצגת התאריך כולל השנה
                const label = context[0].label;
                return label;  // מציג את התאריך או החודש עם השנה
              },
              label: (context: any) => {
                const rawValue = Math.round(context.raw); // הערך המעוגל של ה-tooltip
                const value = rawValue.toLocaleString('he-IL'); // הוספת פסיקים לפי סטנדרט עברי
                const businessType = context.dataset.label; // "העסק שלי" או "עסקים דומים"

                // הגדרת הסיומת בהתאם ל-dataType שמגיע מהפרופס
                let suffix = '';
                if (dataType === 'מכירות') {
                  suffix = ' ש"ח';
                } else if (dataType === 'קונים') {
                  suffix = ' קונים';
                } else if (dataType === 'המלצות') {
                  suffix = ' המלצות';
                }

                // מחזירים את המידע בפורמט המבוקש
                return `${businessType}: ${value}${suffix}`;
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
                size: 16,
                weight: 'normal'
              }
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
              text: getYAxisLabel(dataType),  // פונקציה שתתן את הכיתוב לפי ה-dataType
              color: '#fff',  // צבע הכיתוב
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

function getYAxisLabel(dataType: string) {
  switch (dataType) {
    case 'מכירות':
      return 'מכירות בשקלים';
    case 'קונים':
      return 'מספר קונים';
    case 'המלצות':
      return 'מספר המלצות';
    default:
      return '';
  }
}
    
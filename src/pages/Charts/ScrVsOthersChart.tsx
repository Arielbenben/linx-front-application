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
type TimeRange = 'שבועי' | 'חודשי';

interface ComparisonChartProps {
  timeRange: TimeRange;
  dataType: DataType;
}

function getApiUrl(timeRange: TimeRange, dataType: DataType, smbId: number): string {
  const base = 'https://render-d9ko.onrender.com/api/analyze/';
  const path = {
    'קונים': 'compare-customers',
    'מכירות': 'compare-sales',
    'המלצות': 'compare-recommendations',
  }[dataType];
  return `${base}${path}/${timeRange === 'חודשי' ? 'monthly' : 'weekly'}/${smbId}`;
}

function buildComparisonChartData(apiData: any[], dataType: DataType, smbName: string, timeRange: TimeRange) {
  const labels = apiData.map(item => {
    const date = new Date(item.start_date);
    return date.toLocaleDateString('he-IL', timeRange === 'חודשי'
      ? { month: 'short', year: '2-digit' }
      : { day: '2-digit', month: '2-digit' }
    );
  });

  let myData: number[] = [];
  let othersData: number[] = [];

  switch (dataType) {
    case 'מכירות':
      myData = apiData.map(item => item.my_total_transaction_amount);
      othersData = apiData.map(item => item.similar_avg_transaction_amount);
      break;
    case 'קונים':
      myData = apiData.map(item => item.my_customers_count);
      othersData = apiData.map(item => item.similar_avg_customers_count);
      break;
    case 'המלצות':
      myData = apiData.map(item => item.my_recommendations_count);
      othersData = apiData.map(item => item.similar_avg_recommendations_count);
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
      options={{
        responsive: true,
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: '#333',
            titleColor: '#fff',
            bodyColor: '#fff',
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

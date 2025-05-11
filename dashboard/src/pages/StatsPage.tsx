/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import api from '../api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import styles from './StatsPage.module.css';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface StatsData {
  errorsByDay: { date: string; count: number }[];
  responseTimeByDay: { date: string; avgTime: number }[];
  errorsByType: { type: string; count: number }[];
  topErrors: { message: string; count: number }[];
}

export default function StatsPage() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development';
  const appVersion = import.meta.env.VITE_APP_VERSION;

  useEffect(() => {
    if (isDevMode) {
      console.log(`StatsPage initialized. App version: ${appVersion}`);
    }
    fetchStats();
  }, [isDevMode, appVersion]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Errors by day/hour
      const errorsByDayRes = await api.get(`${apiUrl}/stats/errors-per-hour`);
      // 2. Top errors
      const topErrorsRes = await api.get(`${apiUrl}/errors/grouped`);
      // 3. Logs for errorsByType and responseTimeByDay (если сервер поддерживает)
      // Здесь предполагается, что /logs возвращает массив логов с нужными полями
      const logsRes = await api.get(`${apiUrl}/logs/export?format=json`);
      const logs = logsRes.data;

      // Группировка по типу
      const errorsByType: { type: string; count: number }[] = [];
      const typeMap: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any) => {
        if (log.type) {
          typeMap[log.type] = (typeMap[log.type] || 0) + 1;
        }
      });
      for (const type in typeMap) {
        errorsByType.push({ type, count: typeMap[type] });
      }

      // Группировка по дате для responseTimeByDay (если есть поле responseTime)
      const responseTimeMap: Record<string, { sum: number; count: number }> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logs.forEach((log: any) => {
        if (log.data && log.data.responseTime) {
          const date = new Date(log.timestamp).toISOString().split('T')[0];
          if (!responseTimeMap[date]) responseTimeMap[date] = { sum: 0, count: 0 };
          responseTimeMap[date].sum += log.data.responseTime;
          responseTimeMap[date].count += 1;
        }
      });
      const responseTimeByDay = Object.entries(responseTimeMap).map(([date, { sum, count }]) => ({
        date,
        avgTime: count ? sum / count : 0,
      }));

      setStatsData({
        errorsByDay: errorsByDayRes.data.data || [],
        responseTimeByDay,
        errorsByType,
        topErrors: topErrorsRes.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats();
  };

  return (
    <div className={styles.container}>
      {/* Date Range Filter */}
      <div className={styles.card}>
        <h2 className={styles.textLg}>Date Range</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="start" className={styles.label}>Start Date</label>
            <input
              type="date"
              id="start"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="end" className={styles.label}>End Date</label>
            <input
              type="date"
              id="end"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className={styles.input}
            />
          </div>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className={styles.grid}>
        {/* Errors Over Time */}
        <div className={styles.card}>
          <h2 className={styles.textLg}>Errors Over Time</h2>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : statsData && statsData.errorsByDay?.length > 0 ? (
              <Line
                data={{
                  labels: statsData.errorsByDay.map((stat) => new Date(stat.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Errors',
                      data: statsData.errorsByDay.map((stat) => stat.count),
                      borderColor: 'rgb(239, 68, 68)',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      tension: 0.3,
                      fill: true,
                      pointBackgroundColor: 'rgb(239, 68, 68)',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                      },
                      bodyFont: {
                        size: 13,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        precision: 0,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                }}
              />
            ) : (
              <div className={styles.noData}>No data available</div>
            )}
          </div>
        </div>

        {/* Response Time */}
        <div className={styles.card}>
          <h2 className={styles.textLg}>Response Time (ms)</h2>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : statsData && statsData.responseTimeByDay?.length > 0 ? (
              <Line
                data={{
                  labels: statsData.responseTimeByDay.map((stat) => new Date(stat.date).toLocaleDateString()),
                  datasets: [
                    {
                      label: 'Avg Response Time',
                      data: statsData.responseTimeByDay.map((stat) => stat.avgTime),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      tension: 0.3,
                      fill: true,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: 12,
                      titleFont: {
                        size: 14,
                      },
                      bodyFont: {
                        size: 13,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                }}
              />
            ) : (
              <div className={styles.noData}>No data available</div>
            )}
          </div>
        </div>

        {/* Top Errors */}
        <div className={styles.card}>
          <h2 className={styles.textLg}>Top Errors</h2>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : statsData && statsData.topErrors?.length > 0 ? (
              <Bar
                data={{
                  labels: statsData.topErrors.map((err) => 
                    err.message.length > 25 ? `${err.message.substring(0, 25)}...` : err.message
                  ),
                  datasets: [
                    {
                      label: 'Occurrences',
                      data: statsData.topErrors.map((err) => err.count),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                      borderColor: 'rgb(239, 68, 68)',
                      borderWidth: 1,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: 12,
                      callbacks: {
                        title: (items) => {
                          const dataIndex = items[0].dataIndex;
                          return statsData.topErrors[dataIndex].message;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.noData}>No error data available</div>
            )}
          </div>
        </div>

        {/* Errors by Type */}
        <div className={styles.card}>
          <h2 className={styles.textLg}>Errors by Type</h2>
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.spinner}></div>
            ) : statsData && statsData.errorsByType?.length > 0 ? (
              <Doughnut
                data={{
                  labels: statsData.errorsByType.map((item) => item.type),
                  datasets: [
                    {
                      data: statsData.errorsByType.map((item) => item.count),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',    // Red
                        'rgba(59, 130, 246, 0.8)',   // Blue
                        'rgba(245, 158, 11, 0.8)',   // Amber
                        'rgba(16, 185, 129, 0.8)',   // Green
                        'rgba(139, 92, 246, 0.8)',   // Purple
                        'rgba(236, 72, 153, 0.8)',   // Pink
                      ],
                      borderColor: [
                        'rgb(239, 68, 68)',    // Red
                        'rgb(59, 130, 246)',   // Blue
                        'rgb(245, 158, 11)',   // Amber
                        'rgb(16, 185, 129)',   // Green
                        'rgb(139, 92, 246)',   // Purple
                        'rgb(236, 72, 153)',   // Pink
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: 12,
                    },
                  },
                }}
              />
            ) : (
              <div className={styles.noData}>No type data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className={styles.gridCols}>
        <div className={styles.card}>
          <h3 className={styles.textSm}>Total Errors</h3>
          <p className={styles.text3xl}>
            {loading ? (
              <span className={styles.animatePulse}>...</span>
            ) : (
              statsData?.errorsByDay?.reduce((sum, day) => sum + day.count, 0) || 0
            )}
          </p>
          <div className={styles.textSmGreen}>In selected period</div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.textSm}>Avg. Response Time</h3>
          <p className={styles.text3xl}>
            {loading ? (
              <span className={styles.animatePulse}>...</span>
            ) : (
              statsData?.responseTimeByDay?.length ?
                (statsData.responseTimeByDay.reduce((sum, day) => sum + day.avgTime, 0) / statsData.responseTimeByDay.length).toFixed(2) + ' ms' :
                'N/A'
            )}
          </p>
          <div className={styles.textSmGray}>Overall average</div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.textSm}>Most Common Error</h3>
          <p className={styles.textXl}>
            {loading ? (
              <span className={styles.animatePulse}>...</span>
            ) : (
              statsData?.topErrors?.[0]?.message || 'None'
            )}
          </p>
          <div className={styles.textSmGray}>
            {loading ? '' : (statsData?.topErrors?.[0]?.count || 0)} occurrences
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.textSm}>Error Free Days</h3>
          <p className={styles.text3xl}>
            {loading ? (
              <span className={styles.animatePulse}>...</span>
            ) : (
              statsData?.errorsByDay?.filter(day => day.count === 0).length || 0
            )}
          </p>
          <div className={styles.textSmGray}>
            Out of {statsData?.errorsByDay?.length || 0} days
          </div>
        </div>
      </div>
    </div>
  );
}
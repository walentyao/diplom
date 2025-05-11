/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StatsData {
  errorsByDay: { date: string; count: number }[];
  responseTimeByDay: { date: string; avgTime: number }[];
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
      const response = await axios.get(
        `${apiUrl}/stats?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setStatsData(response.data);
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Error Statistics</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-4">
            <div>
              <label htmlFor="start" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="end" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm"
          >
            Update
          </button>
        </form>
        <div className="h-[400px]">
          {loading ? (
            <p>Loading...</p>
          ) : statsData ? (
            <Line
              data={{
                labels: statsData.errorsByDay.map((stat) => stat.date),
                datasets: [
                  {
                    label: 'Errors by Day',
                    data: statsData.errorsByDay.map((stat) => stat.count),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Error Rate Over Time',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Errors',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                    },
                  },
                },
              }}
            />
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
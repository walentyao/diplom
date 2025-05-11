import { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ErrorStats {
  hour: string;
  count: number;
}

export default function StatsPage() {
  const [errorStats, setErrorStats] = useState<ErrorStats[]>([]);

  useEffect(() => {
    fetchErrorStats();
  }, []);

  const fetchErrorStats = async () => {
    try {
      const response = await axios.get('/api/stats/errors-per-hour');
      setErrorStats(response.data);
    } catch (error) {
      console.error('Error fetching error stats:', error);
    }
  };

  const chartData = {
    labels: errorStats.map(stat => stat.hour),
    datasets: [
      {
        label: 'Errors per Hour',
        data: errorStats.map(stat => stat.count),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
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
          text: 'Hour',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Error Statistics</h2>
        <div className="h-[400px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Error Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">Total Errors</h3>
              <p className="mt-2 text-3xl font-semibold text-red-600">
                {errorStats.reduce((sum, stat) => sum + stat.count, 0)}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">Average per Hour</h3>
              <p className="mt-2 text-3xl font-semibold text-yellow-600">
                {errorStats.length > 0
                  ? Math.round(
                      errorStats.reduce((sum, stat) => sum + stat.count, 0) / errorStats.length
                    )
                  : 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Peak Hour</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {errorStats.length > 0
                  ? errorStats.reduce((max, stat) =>
                      stat.count > max.count ? stat : max
                    ).hour
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
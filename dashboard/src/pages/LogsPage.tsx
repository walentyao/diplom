import { useState, useEffect } from 'react';
import axios from 'axios';

interface Log {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  context: Record<string, unknown>;
  fingerprint: string;
  severityScore: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development';
  const logLevel = import.meta.env.VITE_LOG_LEVEL;

  useEffect(() => {
    if (isDevMode) {
      console.log(`LogsPage initialized. Log level: ${logLevel}`);
    }
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevMode, logLevel]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/logs?`;
      if (filter.level) url += `level=${filter.level}&`;
      if (filter.startDate) url += `startDate=${filter.startDate}&`;
      if (filter.endDate) url += `endDate=${filter.endDate}&`;
      if (filter.search) url += `search=${filter.search}&`;

      const response = await axios.get(url);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-medium">Filters</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Level</label>
            <select
              name="level"
              value={filter.level}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="col-span-1 md:col-span-4">
            <button
              type="submit"
              className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${log.level === 'error' ? 'bg-red-100 text-red-800' : 
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { AdjustmentsVerticalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../api';
import styles from './LogsPage.module.css';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

      const response = await api.get(url);
      // Гарантируем, что logs всегда массив
      setLogs(Array.isArray(response.data) ? response.data : response.data?.data || []);
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

  const getSeverityClass = (level: string, score?: number) => {
    if (level === 'error' || (score && score > 70)) {
      return styles.severityError;
    } else if (level === 'warning' || (score && score > 40)) {
      return styles.severityWarning;
    } else {
      return styles.severityInfo;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header with filter toggle */}
      <div className={styles.header}>
        <h2 className={styles.title}>Application Logs</h2>
        <div className={styles.actions}>
          <button
            onClick={() => fetchLogs()}
            className={styles.refreshButton}
            disabled={loading}
          >
            <ArrowPathIcon className={`${styles.refreshIcon} ${loading ? styles.spin : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={styles.filterButton}
          >
            <AdjustmentsVerticalIcon className={styles.filterIcon} />
            Filters
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {isFilterOpen && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Log Filters</h3>
          <form onSubmit={handleSubmit} className={styles.filterForm}>
            <div>
              <label className={styles.label}>Log Level</label>
              <select
                name="level"
                value={filter.level}
                onChange={handleFilterChange}
                className={styles.select}
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div>
              <label className={styles.label}>Start Date</label>
              <input
                type="datetime-local"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Search Term</label>
              <input
                type="text"
                name="search"
                placeholder="Search in log messages"
                value={filter.search}
                onChange={handleFilterChange}
                className={styles.input}
              />
            </div>
            <div className={styles.filterActions}>
              <button
                type="submit"
                className={styles.applyButton}
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Table */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <ArrowPathIcon className={styles.loadingIcon} />
            <p className={styles.loadingText}>Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.noLogs}>
            <p className={styles.noLogsText}>No logs found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Level</th>
                  <th className={styles.tableHeaderCell}>Message</th>
                  <th className={styles.tableHeaderCell}>Timestamp</th>
                  <th className={styles.tableHeaderCell}>Severity</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {logs.map((log) => (
                  <tr key={log.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.badge} ${
                          log.level === 'error' ? styles.badgeError : 
                          log.level === 'warning' ? styles.badgeWarning : 
                          log.level === 'debug' ? styles.badgeDebug :
                          styles.badgeInfo
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{log.message}</td>
                    <td className={styles.tableCell}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.severity}>
                        <div className={`${styles.severityBar} ${getSeverityClass(log.level, log.severityScore)}`}>
                          <div 
                            className={styles.severityFill} 
                            style={{ width: `${log.severityScore || 0}%` }}
                          ></div>
                        </div>
                        <span className={styles.severityScore}>{log.severityScore || 0}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../api';
import styles from './AlertsPage.module.css';

interface AlertRule {
  id: number;
  type: 'error' | 'performance' | 'request' | 'custom_event';
  threshold: number;
  intervalMinutes: number;
  level?: 'info' | 'warn' | 'error' | 'critical';
  projectId: string;
  isActive: boolean;
  notifyType: 'email' | 'webhook' | 'slack' | 'telegram';
  notifyTarget: string;
}

const defaultNewRule: Omit<AlertRule, 'id'> = {
  type: 'error',
  threshold: 1,
  intervalMinutes: 5,
  level: 'error',
  projectId: '',
  isActive: true,
  notifyType: 'email',
  notifyTarget: '',
};

const AlertsPage: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [newRule, setNewRule] = useState<Omit<AlertRule, 'id'>>(defaultNewRule);
  const apiUrl = import.meta.env.VITE_API_URL;
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const isDevMode = import.meta.env.VITE_NODE_ENV === 'development';

  useEffect(() => {
    if (isDevMode) {
      console.log(`Loading alerts page, app version: ${appVersion}`);
    }
    fetchRules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevMode, appVersion]);

  const fetchRules = async () => {
    try {
      const response = await api.get(`${apiUrl}/alerts/rules`);
      setRules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`${apiUrl}/alerts/rules`, newRule);
      setNewRule(defaultNewRule);
      fetchRules();
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  };

  const toggleRule = async (id: number, isActive: boolean) => {
    try {
      await api.put(`${apiUrl}/alerts/rules/${id}`, { isActive: !isActive });
      fetchRules();
    } catch (error) {
      console.error('Error toggling alert rule:', error);
    }
  };

  const deleteRule = async (id: number) => {
    try {
      await api.delete(`${apiUrl}/alerts/rules/${id}`);
      fetchRules();
    } catch (error) {
      console.error('Error deleting alert rule:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* Add New Rule Form */}
      <div className={styles.card}>
        <h2 className={styles.textLg}>Add New Alert Rule</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Type</label>
            <select
              value={newRule.type}
              onChange={e => setNewRule({ ...newRule, type: e.target.value as AlertRule['type'] })}
              className={styles.inputSelect}
              required
            >
              <option value="error">Error</option>
              <option value="performance">Performance</option>
              <option value="request">Request</option>
              <option value="custom_event">Custom Event</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Level</label>
            <select
              value={newRule.level}
              onChange={e => setNewRule({ ...newRule, level: e.target.value as AlertRule['level'] })}
              className={styles.inputSelect}
            >
              <option value="">Any</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Project ID</label>
            <input
              type="text"
              value={newRule.projectId}
              onChange={e => setNewRule({ ...newRule, projectId: e.target.value })}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Threshold</label>
            <input
              type="number"
              value={newRule.threshold}
              onChange={e => setNewRule({ ...newRule, threshold: Number(e.target.value) })}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Interval (minutes)</label>
            <input
              type="number"
              value={newRule.intervalMinutes}
              onChange={e => setNewRule({ ...newRule, intervalMinutes: Number(e.target.value) })}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notification Type</label>
            <select
              value={newRule.notifyType}
              onChange={e => setNewRule({ ...newRule, notifyType: e.target.value as AlertRule['notifyType'] })}
              className={styles.inputSelect}
              required
            >
              <option value="email">Email</option>
              <option value="webhook">Webhook</option>
              <option value="slack">Slack</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Notification Target</label>
            <input
              type="text"
              value={newRule.notifyTarget}
              onChange={e => setNewRule({ ...newRule, notifyTarget: e.target.value })}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.btnSubmit}>
            Add Rule
          </button>
        </form>
      </div>

      {/* Active Rules List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.textLg}>Alert Rules</h2>
        </div>
        <ul className={styles.list}>
          {rules.map((rule) => (
            <li key={rule.id} className={styles.listItem}>
              <div className={styles.flex}>
                <div>
                  <h3 className={styles.textSm}>[{rule.type}] {rule.level || 'any'} / {rule.projectId}</h3>
                  <p className={styles.textGray}>
                    Threshold: {rule.threshold} in {rule.intervalMinutes} min<br />
                    Notify: {rule.notifyType} → {rule.notifyTarget}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => toggleRule(rule.id, rule.isActive)}
                    className={`${styles.btnToggle} ${rule.isActive ? styles.btnActive : styles.btnInactive}`}
                  >
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className={styles.btnInactive}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlertsPage;